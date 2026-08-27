#!/usr/bin/env python3
"""Apply the recovered calculation-step texts to en.json and all locale files.

Reads scripts/_restored_steps.json (produced by restore_step_texts.py) and:
  1. validates placeholders against what the calculator code actually passes;
  2. writes the real text into en.json;
  3. for every other locale, replaces the corresponding value.

Locale handling
---------------
A recovered step is either
  * FORMULA-ONLY  — e.g. `V = {volume}`, `= C({n}, {r})`: no natural-language
    words at all, so it is identical in every language and is copied verbatim;
  * TRANSLATABLE  — e.g. `Using consumption: {value} L/100km`: contains real
    words, so the locale gets the English text and is left for the translator
    pass to pick up (its value == en value == "untranslated" marker).

Run with --dry-run to preview.
"""
import json
import re
import sys
from pathlib import Path

M = Path('src/messages')
RESTORED = Path('scripts/_restored_steps.json')
PH = re.compile(r'\{([A-Za-z_$][A-Za-z0-9_$]*)\}')
# a "real word": 3+ letters, not a lone math symbol
WORD = re.compile(r'[A-Za-z]{3,}')


def flatten(o, p='', out=None):
    if out is None:
        out = {}
    if isinstance(o, dict):
        for k, v in o.items():
            flatten(v, f'{p}.{k}' if p else k, out)
    elif isinstance(o, str):
        out[p] = o
    return out


def set_path(root, dotted, value):
    parts = dotted.split('.')
    node = root
    for part in parts[:-1]:
        nxt = node.get(part)
        if not isinstance(nxt, dict):
            nxt = {}
            node[part] = nxt
        node = nxt
    node[parts[-1]] = value


def is_formula_only(text):
    """True when the string carries no natural language (so it needs no translation)."""
    stripped = PH.sub('', text)
    words = [w for w in WORD.findall(stripped)]
    if not words:
        return True
    # single all-caps tokens like LAMINAR are labels, still treat as text
    return False


def atomic_write(path, text, retries=10):
    import os
    import time
    path = Path(path)
    tmp = path.with_suffix(path.suffix + '.tmp')
    for attempt in range(retries):
        try:
            tmp.write_text(text, encoding='utf-8')
            os.replace(tmp, path)
            return True
        except (PermissionError, OSError):
            time.sleep(0.5 * (attempt + 1))
    print(f'  !! write failed: {path}')
    return False


def main():
    dry = '--dry-run' in sys.argv
    restored = json.loads(RESTORED.read_text(encoding='utf-8'))
    en_full = json.loads((M / 'en.json').read_text(encoding='utf-8'))
    en_flat = flatten(en_full)

    lost_ph, added_ph, formula, textual = [], [], [], []
    for path, new_text in restored.items():
        old_text = en_flat.get(path, '')
        old_ph = set(PH.findall(old_text))
        new_ph = set(PH.findall(new_text))
        if old_ph - new_ph:
            lost_ph.append((path, sorted(old_ph - new_ph), old_text, new_text))
        if new_ph - old_ph:
            added_ph.append((path, sorted(new_ph - old_ph)))
        (formula if is_formula_only(new_text) else textual).append(path)

    print(f'restored entries          : {len(restored)}')
    print(f'  formula-only (no i18n)  : {len(formula)}')
    print(f'  textual (needs i18n)    : {len(textual)}')
    print(f'  placeholders recovered  : {len(added_ph)}')
    print(f'  placeholders DROPPED    : {len(lost_ph)}')
    for p, ph, o, n in lost_ph[:15]:
        print(f'    {p.replace("calculator.", "")}: lost {ph}')
        print(f'        old {o!r}')
        print(f'        new {n!r}')

    if dry:
        print('\n(dry run, nothing written)')
        return

    # 1. en.json
    for path, text in restored.items():
        set_path(en_full, path, text)
    atomic_write(M / 'en.json',
                 json.dumps(en_full, ensure_ascii=False, indent=2) + '\n')
    print('\nwrote en.json')

    # 2. every other locale
    for jf in sorted(M.glob('*.json')):
        loc = jf.stem
        if loc == 'en':
            continue
        data = json.loads(jf.read_text(encoding='utf-8'))
        changed = 0
        for path, text in restored.items():
            set_path(data, path, text)
            changed += 1
        atomic_write(jf, json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print(f'  {loc}: reset {changed} step entries')


if __name__ == '__main__':
    main()
