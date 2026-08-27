#!/usr/bin/env python3
"""Second pass: retry the strings that came back as untouched English.

translate_all.py falls back to the English source whenever a translation comes
back with a broken {placeholder}. Those entries land in the cache as
`value == key`, so they are easy to find and retry. This pass re-fetches them one
by one with the numeric-token protection, keeps whatever now succeeds, and
rewrites the affected locale files.

Strings that legitimately read the same in every language (brand name, file
formats, units) are skipped so we don't burn requests on them forever.
"""
import importlib.util
import json
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    'tr', Path(__file__).resolve().parent / 'translate_all.py')
tr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tr)

M = Path('src/messages')
WORKERS = 3
import time as _time
# things that are identical in every language on purpose
SKIP_EXACT = {
    'baikecalc', 'PDF', 'JSON', 'CSV', 'XML', 'YAML', 'HTML', 'CSS', 'SQL',
    'API', 'URL', 'RGB', 'HEX', 'HSL', 'CMYK', 'UTF-8', 'ASCII', 'Base64',
    'MD5', 'SHA-1', 'SHA-256', 'GIF', 'PNG', 'JPG', 'JPEG', 'WEBP', 'SVG',
    'MP3', 'MP4', 'WAV', 'OK', 'ID', 'IP', 'CPU', 'GPU', 'RAM', 'SSD',
}
LATIN = {'cs', 'de', 'es', 'fr', 'hu', 'id', 'it', 'ms', 'nl', 'pt', 'tr', 'vi'}


def worth_retrying(s):
    if s in SKIP_EXACT or len(s) < 3:
        return False
    if not re.search(r'[A-Za-z]{3,}', tr.PH.sub('', s)):
        return False   # formula / unit only
    if tr.ICU.search(s):
        return False
    # Skip "ident-like" proper nouns / short technical tokens that are commonly
    # kept in English on purpose (e.g. "Frame Rate Converter", "VMware vSphere
    # Foundation (VCF)", "Lean Body Mass"). Only retry real sentence-like text.
    stripped = s.strip()
    if re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9 ._\\()/-]{0,24}', stripped) \
            and len(stripped.split()) <= 3 and not re.search(r'[.!?:]', stripped):
        return False
    return True


def main():
    only = sys.argv[1:] or tr.LOCALES
    cache = json.loads(tr.CACHE_FILE.read_text(encoding='utf-8'))
    en = tr.flatten(json.loads((M / 'en.json').read_text(encoding='utf-8')))

    grand_fixed = 0
    for loc in only:
        lcache = cache.get(loc)
        if not lcache:
            print(f'{loc}: no cache, skipped')
            continue
        tl = tr.TL.get(loc, loc)
        failed = [k for k, v in lcache.items() if k == v and worth_retrying(k)]
        if not failed:
            print(f'{loc}: nothing to repair')
            continue
        print(f'{loc}: retrying {len(failed)} fallbacks ...', flush=True)
        fixed = 0
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futs = {ex.submit(tr.translate_one, s, tl): s for s in failed}
            for fut in as_completed(futs):
                _time.sleep(0.15)   # gentle pacing to avoid rate-limit throttle
                src = futs[fut]
                try:
                    got = fut.result()
                except Exception:
                    continue
                if got and got != src:
                    lcache[src] = got
                    fixed += 1
        tr.atomic_write(tr.CACHE_FILE, json.dumps(cache, ensure_ascii=False))
        # push the newly repaired strings into the locale file
        locf = tr.flatten(json.loads((M / f'{loc}.json').read_text(encoding='utf-8')))
        applied = 0
        for path, enval in en.items():
            if locf.get(path) == enval and lcache.get(enval, enval) != enval:
                locf[path] = lcache[enval]
                applied += 1
        if applied:
            tr.atomic_write(M / f'{loc}.json',
                            json.dumps(tr.unflatten(locf), ensure_ascii=False,
                                       indent=2) + '\n')
        grand_fixed += fixed
        print(f'  {loc}: repaired {fixed}/{len(failed)} strings, '
              f'{applied} keys updated', flush=True)

    print(f'\nTOTAL repaired strings: {grand_fixed}')


if __name__ == '__main__':
    main()
