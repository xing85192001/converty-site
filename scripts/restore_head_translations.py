#!/usr/bin/env python3
"""Put back the genuine locale translations that apply_restored_steps.py reset to English.

apply_restored_steps.py rewrote every recovered `steps.*` entry in every locale
with the English text, which is correct for the 900+ codemod-junk entries but
also wiped the handful of real translations that already existed in HEAD
(mostly calculator.automotive.financing, plus ~146 Chinese ones).

scripts/_head_keep.json (built by diag_head_translations.py) holds only the HEAD
values that are safe to restore: their placeholder set matches the recovered
English exactly, and for non-Latin locales the value really is in the native
script. Anything whose placeholders no longer line up with what the calculator
code passes is deliberately left in English so the translator pass redoes it.
"""
import json
import os
import re
import sys
import time
from pathlib import Path

M = Path('src/messages')
KEEP = Path('scripts/_head_keep.json')
RESTORED = Path('scripts/_restored_steps.json')
PH = re.compile(r'\{([A-Za-z_$][A-Za-z0-9_$]*)\}')


def get_path(root, dotted):
    node = root
    for part in dotted.split('.'):
        if not isinstance(node, dict) or part not in node:
            return None
        node = node[part]
    return node if isinstance(node, str) else None


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


def atomic_write(path, text, retries=10):
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
    keep = json.loads(KEEP.read_text(encoding='utf-8'))
    restored = json.loads(RESTORED.read_text(encoding='utf-8'))

    total_put, total_skip, unsafe = 0, 0, 0
    for loc, entries in sorted(keep.items()):
        jf = M / f'{loc}.json'
        data = json.loads(jf.read_text(encoding='utf-8'))
        put, skip = 0, 0
        for dotted, value in entries.items():
            en_text = restored.get(dotted)
            if en_text is None:
                continue
            # never re-introduce a placeholder mismatch
            if set(PH.findall(value)) != set(PH.findall(en_text)):
                unsafe += 1
                continue
            cur = get_path(data, dotted)
            if cur != en_text:
                # somebody already translated it (or shape changed) - leave alone
                skip += 1
                continue
            if not dry:
                set_path(data, dotted, value)
            put += 1
        if not dry and put:
            atomic_write(jf, json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        total_put += put
        total_skip += skip
        print(f'  {loc:6s} restored={put:4d} skipped={skip}')

    print(f'\ntotal restored: {total_put}, skipped: {total_skip}, rejected(unsafe): {unsafe}')
    if dry:
        print('(dry run, nothing written)')


if __name__ == '__main__':
    main()
