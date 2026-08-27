#!/usr/bin/env python3
"""One-shot health report for the 22 message catalogues.

Checks, per locale:
  missing      - key present in en.json but absent here (next-intl falls back)
  extra        - key here but not in en.json (dead weight / stale)
  junk         - value looks like the key name rather than real text
                 (`cylVSquared` -> "cylvsquared: ..."), the codemod fallout
  ph_mismatch  - placeholder set differs from en -> renders literal {foo}
  english      - value identical to en (untranslated fallback), excluding
                 formula-only strings which are meant to be identical
"""
import json
import re
from pathlib import Path

M = Path('src/messages')
PH = re.compile(r'\{([^}]+)\}')
WORD = re.compile(r'[A-Za-z]{3,}')
LOCALES = ['ar', 'cs', 'de', 'el', 'es', 'fr', 'hu', 'id', 'it', 'ja', 'ko',
           'ms', 'nl', 'pt', 'ru', 'th', 'tr', 'uk', 'vi', 'zh', 'zh-TW']


def flatten(o, p='', out=None):
    if out is None:
        out = {}
    if isinstance(o, dict):
        for k, v in o.items():
            flatten(v, f'{p}.{k}' if p else k, out)
    elif isinstance(o, str):
        out[p] = o
    return out


def formula_only(s):
    return not WORD.search(PH.sub('', s))


def is_junk(path, value):
    """The codemod wrote de-camel-cased key names as text; detect the leftovers.

    A value that merely equals its key is NOT automatically junk: `common.close`
    legitimately reads "Close". Real junk is the machine-generated form - the key
    name lower-cased and stripped of word boundaries ("cylvsquared"), i.e. no
    capital letter anywhere and no spacing that a human would have written.
    """
    last = path.split('.')[-1]
    keyn = re.sub(r'[^a-z0-9]', '', last.lower())
    norm = re.sub(r'[^a-z0-9]', '', value.lower())
    if len(keyn) < 8 or norm != keyn:
        return False
    # a human-written label keeps its capital / spacing; junk does not
    if re.search(r'[A-Z]', value) or ' ' in value.strip():
        return False
    return True


def main():
    en = flatten(json.loads((M / 'en.json').read_text(encoding='utf-8')))
    en_junk = [p for p, v in en.items() if is_junk(p, v)]
    print(f'en.json keys: {len(en)}   junk in en: {len(en_junk)}')
    for p in en_junk[:10]:
        print(f'   ! {p} = {en[p]!r}')

    hdr = f"{'loc':6s} {'missing':>7s} {'extra':>6s} {'junk':>5s} {'ph_bad':>6s} {'english':>7s}"
    print('\n' + hdr)
    print('-' * len(hdr))
    worst = {}
    for loc in LOCALES:
        f = flatten(json.loads((M / f'{loc}.json').read_text(encoding='utf-8')))
        missing = [k for k in en if k not in f]
        extra = [k for k in f if k not in en]
        junk = [k for k, v in f.items() if is_junk(k, v)]
        ph_bad = [k for k, v in f.items()
                  if k in en and set(PH.findall(v)) != set(PH.findall(en[k]))]
        english = [k for k, v in f.items()
                   if k in en and v == en[k] and not formula_only(v)]
        worst[loc] = dict(missing=missing, extra=extra, junk=junk,
                          ph_bad=ph_bad, english=english)
        print(f'{loc:6s} {len(missing):7d} {len(extra):6d} {len(junk):5d} '
              f'{len(ph_bad):6d} {len(english):7d}')

    for name in ('junk', 'ph_bad', 'missing'):
        offenders = {l: d[name] for l, d in worst.items() if d[name]}
        if not offenders:
            print(f'\n{name}: none anywhere')
            continue
        print(f'\n{name} samples:')
        for loc, keys in list(offenders.items())[:4]:
            print(f'  {loc}: {len(keys)}')
            for k in keys[:4]:
                print(f'      {k}')


if __name__ == '__main__':
    main()
