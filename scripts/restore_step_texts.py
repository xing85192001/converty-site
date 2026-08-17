#!/usr/bin/env python3
"""Restore the original calculation-step texts that a previous i18n codemod destroyed.

Background
----------
Commit 11a1ce0 ("feat(i18n): translate hardcoded English UI strings") converted
hardcoded step strings into structured CalcStep objects:

    BEFORE (48a2fd3):  steps.push(`V = pi x ${radius ** 2} x ${height}`)
    AFTER  (11a1ce0):  steps.push({ key: "cylVSquared", params: { radiusSquared: radius ** 2, height } })

but when it generated en.json it did NOT carry the original text over. Instead it
derived a placeholder from the key name:

    "cylVSquared": "Cyl V Squared: {radiusSquared}"     <-- meaningless

The original texts are mathematical formulas, which are language neutral. This
script recovers them from the pre-codemod commit and rebuilds the `steps.*`
entries so every locale can share the identical formula.

Method
------
For each file that contains `steps.push({ key: ... })`:
  1. Parse the NEW file: ordered list of (key, [param names]).
  2. Parse the OLD file at BASE: ordered list of template literals.
  3. Align them positionally (the codemod preserved order 1:1).
  4. Rewrite `${expr}` -> `{paramName}` using the param order of the new call.

Only writes entries where alignment is unambiguous; everything else is reported
so it can be handled manually.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

BASE = '48a2fd3'
M = Path('src/messages')

PUSH_START = re.compile(r'steps\.push\(')
KEY_IN_OBJ = re.compile(r'\bkey:\s*"([A-Za-z0-9_]+)"')
PARAMS_IN_OBJ = re.compile(r'\bparams:\s*\{')


def scan_push_args(src):
    """Return the raw argument text of every `steps.push(...)` call, in order.

    Uses paren/brace balancing (skipping strings, template literals, comments)
    so multi-line calls and nested objects are handled correctly — a plain
    regex cannot do this reliably.
    """
    args = []
    for m in PUSH_START.finditer(src):
        i = m.end()          # just after '('
        depth = 1
        start = i
        in_str = None
        while i < len(src) and depth:
            ch = src[i]
            if in_str:
                if ch == '\\':
                    i += 2
                    continue
                if ch == in_str:
                    in_str = None
                i += 1
                continue
            if ch in '"\'`':
                in_str = ch
                i += 1
                continue
            if src.startswith('//', i):
                nl = src.find('\n', i)
                i = len(src) if nl == -1 else nl
                continue
            if src.startswith('/*', i):
                end = src.find('*/', i)
                i = len(src) if end == -1 else end + 2
                continue
            if ch in '([{':
                depth += 1
            elif ch in ')]}':
                depth -= 1
                if depth == 0:
                    break
            i += 1
        args.append(src[start:i].strip())
    return args


def parse_new_arg(arg):
    """`{ key: "x", params: { a, b: expr } }` -> ("x", ["a", "b"]) or None."""
    km = KEY_IN_OBJ.search(arg)
    if not km:
        return None
    pm = PARAMS_IN_OBJ.search(arg)
    if not pm:
        return km.group(1), []
    # balanced-extract the params object body
    i = pm.end()
    depth, start, in_str = 1, i, None
    while i < len(arg) and depth:
        ch = arg[i]
        if in_str:
            if ch == '\\':
                i += 2
                continue
            if ch == in_str:
                in_str = None
            i += 1
            continue
        if ch in '"\'`':
            in_str = ch
        elif ch in '([{':
            depth += 1
        elif ch in ')]}':
            depth -= 1
            if depth == 0:
                break
        i += 1
    return km.group(1), split_params(arg[start:i])


def parse_old_arg(arg):
    """A pre-codemod push arg -> its literal body, or None if not a literal.

    Handles template literals (`...`) as well as plain string literals
    ("..." / '...'), which the codemod also converted into CalcStep keys.
    """
    arg = arg.strip()
    if len(arg) >= 2 and arg[0] == arg[-1] and arg[0] in '`"\'':
        body = arg[1:-1]
        if arg[0] != '`':
            # a plain string cannot contain interpolations; unescape quotes
            body = body.replace('\\"', '"').replace("\\'", "'")
        return body
    return None


def git_show(rev, path):
    try:
        return subprocess.run(['git', 'show', f'{rev}:{path}'],
                              capture_output=True, text=True, check=True,
                              encoding='utf-8').stdout
    except subprocess.CalledProcessError:
        return None


def split_params(blob):
    """Extract param NAMES in source order from a params object body.

    Handles shorthand (`height`), explicit (`radiusSquared: radius ** 2`) and
    nested braces/parens/strings.
    """
    if not blob:
        return []
    names, depth, buf = [], 0, ''
    in_str = None
    for ch in blob:
        if in_str:
            buf += ch
            if ch == in_str:
                in_str = None
            continue
        if ch in '"\'`':
            in_str = ch
            buf += ch
            continue
        if ch in '{[(':
            depth += 1
        elif ch in '}])':
            depth -= 1
        if ch == ',' and depth == 0:
            names.append(buf)
            buf = ''
        else:
            buf += ch
    if buf.strip():
        names.append(buf)
    out = []
    for part in names:
        part = part.strip()
        if not part:
            continue
        name = part.split(':', 1)[0].strip() if ':' in part else part
        name = name.strip().strip('.')
        if re.fullmatch(r'[A-Za-z_$][A-Za-z0-9_$]*', name):
            out.append(name)
    return out


def extract_interps(tpl):
    """Split a JS template literal into literal chunks and ${...} expressions."""
    chunks, exprs = [], []
    i, buf = 0, ''
    while i < len(tpl):
        if tpl.startswith('${', i):
            depth, j = 1, i + 2
            while j < len(tpl) and depth:
                if tpl[j] == '{':
                    depth += 1
                elif tpl[j] == '}':
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            chunks.append(buf)
            buf = ''
            exprs.append(tpl[i + 2:j])
            i = j + 1
        else:
            buf += tpl[i]
            i += 1
    chunks.append(buf)
    return chunks, exprs


# Cases the automatic mapping cannot infer, resolved by reading both revisions.
# Values are the restored en.json text; extra unused params are harmless in
# next-intl, missing ones are dropped from the wording.
MANUAL = {
    'calculator.engineering.pipeFlow.steps.flowRegimeLaminar':
        'Flow regime: LAMINAR (Re < 2,300)',
    'calculator.engineering.pipeFlow.steps.flowRegimeTransitional':
        'Flow regime: TRANSITIONAL (2,300 ≤ Re < 4,000)',
    'calculator.engineering.pipeFlow.steps.flowRegimeTurbulent':
        'Flow regime: TURBULENT (Re ≥ 4,000)',
    # original interpolated a running step number that is no longer passed
    'calculator.engineering.stressStrain.steps.safetyFactorTitle':
        'Safety factor',
    # the old hardcoded "$6,155" / "$1,069" became the costPerPack param
    'calculator.infrastructure.hypervConsolidation.steps.dcCost':
        '  - Cost: {datacenterTotalCorePacks} × ${costPerPack} = ${totalCost}',
    'calculator.infrastructure.hypervConsolidation.steps.stdCost':
        '  - Cost: {standardTotalCorePacks} × ${costPerPack} = ${totalCost}',
    # ternaries became the direction / comparison params
    'calculator.math.quadratic.steps.parabolaDirection':
        'Parabola opens {direction} (a {comparison} 0)',
    # old code pushed matrixToString(m) directly — the value IS the matrix dump,
    # so the message is just the placeholder with no label
    'calculator.math.matrix.steps.matrixAContent': '{content}',
    'calculator.math.matrix.steps.addMatrixBContent': '{content}',
    'calculator.math.matrix.steps.subMatrixBContent': '{content}',
    'calculator.math.matrix.steps.mulMatrixBContent': '{content}',
    # these three were `steps: [...]` array literals, not steps.push(...)
    'calculator.math.binary.steps.binaryOpNot': 'NOT {binary} = {result}',
    'calculator.cooking.foodCost.steps.noIngredientsAdded':
        'No ingredients added',
    'calculator.cooking.nutritionCalculator.steps.noFoodsSelected':
        'No foods selected',
}


def tpl_to_icu(tpl, params):
    """Convert `V = pi x ${radius ** 2} x ${height}` + [radiusSquared, height]
    into `V = pi x {radiusSquared} x {height}`.

    Two mapping strategies:
      1. positional, when interpolation count == param count;
      2. unique-expression, when the template repeats an expression but the
         codemod de-duplicated it into a single param (e.g. `2({l}{w} + {w}{h})`
         has 4 interpolations but only params l, w, h).
    """
    chunks, exprs = extract_interps(tpl)

    def build(names):
        out = chunks[0]
        for idx, name in enumerate(names):
            out += '{' + name + '}' + chunks[idx + 1]
        return out.replace('\\`', '`').replace('\\$', '$').replace('\\\\', '\\').strip()

    if len(exprs) == len(params):
        return build(params)

    uniq = list(dict.fromkeys(exprs))
    if uniq and len(uniq) == len(params):
        expr_to_param = dict(zip(uniq, params))
        return build([expr_to_param[e] for e in exprs])
    return None


def ns_candidates(key, en_flat):
    """All en.json paths ending in `.steps.<key>`."""
    return [k for k in en_flat if k.endswith(f'.steps.{key}')]


def infer_file_namespace(keys, en_flat):
    """Determine the single message namespace a source file writes into.

    All steps emitted by one calculator module live under one namespace, so any
    key that resolves uniquely pins the namespace for the whole file. That lets
    us disambiguate keys whose short name (e.g. `totalCost`) appears in several
    namespaces.
    """
    from collections import Counter
    votes = Counter()
    for key in keys:
        hits = ns_candidates(key, en_flat)
        if len(hits) == 1:
            votes[hits[0].rsplit('.steps.', 1)[0]] += 1
    if votes:
        return votes.most_common(1)[0][0]
    # no unique key: fall back to the namespace that covers the most keys
    votes = Counter()
    for key in keys:
        for h in ns_candidates(key, en_flat):
            votes[h.rsplit('.steps.', 1)[0]] += 1
    return votes.most_common(1)[0][0] if votes else None


def flatten(o, p='', out=None):
    if out is None:
        out = {}
    if isinstance(o, dict):
        for k, v in o.items():
            flatten(v, f'{p}.{k}' if p else k, out)
    elif isinstance(o, str):
        out[p] = o
    return out


def main():
    en_full = json.loads((M / 'en.json').read_text(encoding='utf-8'))
    en_flat = flatten(en_full)

    files = subprocess.run(
        ['git', 'grep', '-l', 'steps.push({', '--', 'src'],
        capture_output=True, text=True, encoding='utf-8').stdout.split()

    resolved = {}     # full en.json path -> restored text
    param_fix = {}    # entries where the codemod dropped params
    stats = {'files': 0, 'aligned': 0, 'skipped_count_mismatch': 0,
             'skipped_param_mismatch': 0, 'ambiguous': 0, 'no_old': 0, 'manual': 0}
    problems = []

    for rel in files:
        new_src = Path(rel).read_text(encoding='utf-8')
        new_args = scan_push_args(new_src)
        new_calls = [parse_new_arg(a) for a in new_args]
        if not any(new_calls):
            continue
        old_src = git_show(BASE, rel)
        if old_src is None:
            stats['no_old'] += 1
            problems.append(f'{rel}: not present at {BASE}')
            continue
        old_args = scan_push_args(old_src)
        # the codemod dropped pure spacer pushes like steps.push("") — drop them
        # too so the remaining calls line up one-to-one
        if len(old_args) != len(new_args):
            old_args = [a for a in old_args
                        if a.strip() not in ('""', "''", '``')]
        stats['files'] += 1

        if len(old_args) != len(new_args):
            stats['skipped_count_mismatch'] += 1
            problems.append(
                f'{rel}: push count new={len(new_args)} old={len(old_args)}')
            continue

        file_keys = [p[0] for p in new_calls if p]
        ns = infer_file_namespace(file_keys, en_flat)
        if ns is None:
            stats['ambiguous'] += len(file_keys)
            problems.append(f'{rel}: cannot infer namespace')
            continue

        for parsed, old_arg in zip(new_calls, old_args):
            if parsed is None:
                continue      # not a CalcStep push (TextStep / plain string)
            key, params = parsed
            tpl = parse_old_arg(old_arg)
            if tpl is None:
                continue      # old side was not a template literal
            target = f'{ns}.steps.{key}'
            if target not in en_flat:
                stats['ambiguous'] += 1
                problems.append(f'{rel}:{key}: {target} not in en.json')
                continue
            if target in MANUAL:
                resolved[target] = MANUAL[target]
                stats['manual'] += 1
                continue
            text = tpl_to_icu(tpl, params)
            if text is None:
                stats['skipped_param_mismatch'] += 1
                _, exprs = extract_interps(tpl)
                param_fix[target] = {
                    'file': rel, 'key': key,
                    'old_template': tpl,
                    'interps': exprs,
                    'params': params,
                }
                problems.append(
                    f'{rel}:{key}: {len(exprs)} interps vs {len(params)} params')
                continue
            resolved[target] = text
            stats['aligned'] += 1

    # some manual entries live in `steps: [...]` array literals rather than
    # steps.push(...), so the scan above never reaches them
    for target, text in MANUAL.items():
        if target not in resolved and target in en_flat:
            resolved[target] = text
            stats['manual'] += 1

    print(json.dumps(stats, indent=2))
    print(f'\nrestorable entries: {len(resolved)}')
    print('\n--- first 25 restorations ---')
    for k, v in list(resolved.items())[:25]:
        print(f'  {k.replace("calculator.", "")}')
        print(f'      old: {en_flat.get(k)!r}')
        print(f'      new: {v!r}')
    if problems:
        print(f'\n--- {len(problems)} problems (first 30) ---')
        for p in problems[:30]:
            print('  ' + p)

    Path('scripts/_restored_steps.json').write_text(
        json.dumps(resolved, ensure_ascii=False, indent=2), encoding='utf-8')
    Path('scripts/_steps_param_fix.json').write_text(
        json.dumps(param_fix, ensure_ascii=False, indent=2), encoding='utf-8')
    print('\nwrote scripts/_restored_steps.json '
          f'({len(resolved)} entries) and scripts/_steps_param_fix.json '
          f'({len(param_fix)} entries needing code changes)')


if __name__ == '__main__':
    main()
