#!/usr/bin/env python3
"""Cross-check every restored step text against the params the code passes.

A next-intl message that references {foo} while the calculator never passes
`foo` renders the literal "{foo}" to the user, so this must be zero before the
restoration is applied.
"""
import importlib.util
import json
import re
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    'rst', str(Path('scripts/restore_step_texts.py')))
rst = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rst)

PH = re.compile(r'\{([A-Za-z_$][A-Za-z0-9_$]*)\}')
restored = json.loads(Path('scripts/_restored_steps.json').read_text(encoding='utf-8'))
en_flat = rst.flatten(json.loads(Path('src/messages/en.json').read_text(encoding='utf-8')))

# build key -> params-passed-by-code, per namespace
import subprocess
files = subprocess.run(['git', 'grep', '-l', 'steps.push({', '--', 'src'],
                       capture_output=True, text=True, encoding='utf-8').stdout.split()
code_params = {}
for rel in files:
    src = Path(rel).read_text(encoding='utf-8')
    calls = [rst.parse_new_arg(a) for a in rst.scan_push_args(src)]
    keys = [c[0] for c in calls if c]
    ns = rst.infer_file_namespace(keys, en_flat)
    if not ns:
        continue
    for c in calls:
        if not c:
            continue
        key, params = c
        code_params.setdefault(f'{ns}.steps.{key}', set()).update(params)

missing, unknown, ok = [], [], 0
for path, text in restored.items():
    used = set(PH.findall(text))
    passed = code_params.get(path)
    if passed is None:
        unknown.append(path)
        continue
    gap = used - passed
    if gap:
        missing.append((path, sorted(gap), sorted(passed), text))
    else:
        ok += 1

print(f'checked          : {len(restored)}')
print(f'  OK             : {ok}')
print(f'  no code info   : {len(unknown)}')
print(f'  DANGEROUS      : {len(missing)}  (message uses a param the code never passes)')
for p, gap, passed, text in missing[:20]:
    print(f'    {p.replace("calculator.", "")}')
    print(f'        uses    {gap} but code passes {passed}')
    print(f'        text    {text!r}')
if unknown[:10]:
    print('  (no code info samples):')
    for p in unknown[:10]:
        print('    ' + p.replace('calculator.', ''))
