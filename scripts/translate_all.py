#!/usr/bin/env python3
"""Full i18n translation: translate all English-fallback values in every
non-en locale into the target language via Google translate endpoint.

Strategy:
- Only translate keys whose current value EQUALS the English source value
  (untranslated fallback). Existing real translations are preserved.
- BATCHING: split each English string into sentences, send many sentences in
  one request (one sentence per line). gtx returns exactly one segment per
  input sentence, so reconstruction by sentence-count is reliable and we get
  ~30x fewer HTTP requests (avoids per-request throttle).
- PROTECT {placeholders} with xqx...xqx tokens so Google does not translate the
  variable names (which would break next-intl).
- On any segment-count mismatch (rare fragmentation), fall back to translating
  that string individually (one request per string).
- Concurrency via a thread pool; 429/network errors retry with exponential
  backoff. Results cached to disk so a re-run resumes.
- Skip ICU-format strings and values with no alphabetic characters.
"""
import json, os, re, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed


def atomic_write(path, text, retries=10):
    """Write text to path atomically, retrying transient Windows file locks.

    On Windows an editor / cloud-sync / AV scanner can hold a short-lived lock
    on the target file, which raises PermissionError. Retrying with a temp file
    plus os.replace makes the write both atomic and lock-tolerant.
    """
    path = Path(path)
    tmp = path.with_suffix(path.suffix + '.tmp')
    last = None
    for attempt in range(retries):
        try:
            tmp.write_text(text, encoding='utf-8')
            os.replace(tmp, path)
            return True
        except (PermissionError, OSError) as e:
            last = e
            time.sleep(0.5 * (attempt + 1))
    try:
        if tmp.exists():
            tmp.unlink()
    except OSError:
        pass
    print(f"  !! WRITE FAILED {path}: {type(last).__name__} {last}", flush=True)
    return False

M = Path('src/messages')
EN = 'en'
LOCALES = ['ar','cs','de','el','es','fr','hu','id','it','ja','ko','ms','nl',
           'pt','ru','th','tr','uk','vi','zh','zh-TW']
TL = {'zh':'zh-CN','zh-TW':'zh-TW'}
GOOGLE = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={tl}&dt=t&q={q}'
FALLBACK = 'https://clients5.google.com/translate_a/t?client=gtx&sl=en&tl={tl}&dt=t&q={q}'
CACHE_FILE = Path('scripts/translation_cache.json')
WORKERS = 8
BATCH_STRINGS = 20      # single-sentence strings packed into ONE request
BATCH_CHARS = 1400      # ... but never exceed this many raw chars per request
RETRY_BASE = 8.0
CACHE_EVERY = 200

PH = re.compile(r'\{([^}]+)\}')         # {name} {count} {min}
ICU = re.compile(r'\{\s*\w+\s*,\s*(plural|select|number|date)')
NOLETTER = re.compile(r'^[^A-Za-z]*$')
WORD = re.compile(r'[A-Za-z]{3,}')      # a "real" word, not a math symbol/unit
TOK = re.compile(r'xqx\s*(\d+)\s*xqx')   # tolerate spaces Google may inject
# split a string into sentences; keep abbreviations like "U.S." / "e.g." together
SPLIT = re.compile(r'(?<=[.!?])\s+(?=[A-Z0-9("])')


def protect(s):
    """Hide {placeholders} behind xqx<N>xqx tokens.

    The token payload is a NUMBER, not the variable name: a name like
    `xqxcountxqx` still reads as an English word and Google happily translates it
    ("xqxμετρώxqx"), which fails the placeholder check and forces the whole string
    back to English. Digits survive.
    """
    store = {}
    def repl(m):
        tok = f'xqx{len(store)}xqx'
        store[tok] = m.group(1)
        return tok
    return PH.sub(repl, s), store


def restore(s, store):
    def back(m):
        name = store.get('xqx' + m.group(1).strip() + 'xqx')
        return '{' + name + '}' if name is not None else m.group(0)
    s = TOK.sub(back, s)
    # normalize stray unicode spaces that Google sometimes injects
    s = s.replace('\xa0', ' ').replace('\u200b', '').replace('\u200e', '').replace('\u200f', '')
    return s.strip()


def split_sentences(s):
    return [p.strip() for p in SPLIT.split(s) if p.strip()]


def formula_only(s):
    """True for pure math / unit strings such as `V = π × {r2} × {h}` or `L/100km`.

    These read the same in every language, and sending them to Google reliably
    mangles the operators, so they are skipped and left identical across locales.
    """
    return not WORD.search(PH.sub('', s))


def flatten(o, p='', out=None):
    if out is None: out = {}
    if isinstance(o, dict):
        for k, v in o.items():
            flatten(v, f"{p}.{k}" if p else k, out)
    elif isinstance(o, str):
        out[p] = o
    return out


def unflatten(d):
    root = {}
    for path, val in d.items():
        parts = path.split('.')
        node = root
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = val
    return root


class TransError(Exception):
    """kind: 'rate' | 'net' | 'http' | 'parse' | 'seg'.

    'seg' means the endpoint returned a different number of segments than we sent
    lines. That is deterministic for a given payload, so sleeping and retrying is
    pointless - the caller must split the payload instead.
    """

    def __init__(self, msg, retryable=True, kind='net'):
        super().__init__(msg)
        self.retryable = retryable
        self.kind = kind


def _parse_segments(raw):
    """Both endpoints are supported and their shapes differ.

    translate.googleapis.com/translate_a/single -> [[["seg1",...],["seg2",...]],...]
        i.e. one entry per input line (trailing "\\n" preserved).
    clients5.google.com/translate_a/t          -> ["seg1\\nseg2\\nseg3"]
        i.e. ONE string with the lines joined back together.
    Parsing the second shape with the first shape's code yields one "segment"
    per character, which silently breaks every batch.
    """
    data = json.loads(raw)
    if isinstance(data, str):
        return data.split('\n')
    if isinstance(data, list) and data:
        if isinstance(data[0], list):
            return [s[0] for s in data[0]]
        if isinstance(data[0], str):
            if len(data) > 1 and all(isinstance(x, str) for x in data):
                return list(data)
            return data[0].split('\n')
    raise TransError(f'unknown shape {str(data)[:60]}', retryable=False, kind='parse')


def _fetch(url_tmpl, text, tl):
    q = urllib.parse.quote(text, safe='')
    url = url_tmpl.format(tl=tl, q=q)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        r = urllib.request.urlopen(req, timeout=25)
    except urllib.error.HTTPError as e:
        if e.code in (429, 403):
            raise TransError(f"rate-limited {e.code}", retryable=True, kind='rate')
        raise TransError(f"HTTP {e.code}", retryable=False, kind='http')
    except Exception as e:
        raise TransError(f"net {e}", retryable=True, kind='net')
    try:
        return _parse_segments(r.read())
    except TransError:
        raise
    except Exception as e:
        raise TransError(f"parse {e}", retryable=True, kind='parse')


def translate_sentences(sentences, tl):
    """Translate a list of single-line strings (already protected), 1:1."""
    q = '\n'.join(sentences)
    try:
        segs = _fetch(GOOGLE, q, tl)
    except TransError as e:
        if e.retryable:
            segs = _fetch(FALLBACK, q, tl)
        else:
            raise
    if len(segs) != len(sentences):
        raise TransError(f"seg {len(segs)}/{len(sentences)}",
                         retryable=False, kind='seg')
    return segs


def translate_one(enval, tl):
    """Translate one English string in its own request.

    The whole string goes over in a single call and every returned segment is
    concatenated (gtx keeps the trailing spaces inside each segment), so multi
    sentence values need no special handling. Returns the English text unchanged
    if the endpoint keeps failing or mangles a {placeholder}.
    """
    protected, store = protect(enval)
    delay = RETRY_BASE
    for _ in range(5):
        try:
            try:
                segs = _fetch(GOOGLE, protected, tl)
            except TransError as e:
                if not e.retryable:
                    return enval
                segs = _fetch(FALLBACK, protected, tl)
            out = restore(''.join(segs), store)
            if not out or 'xqx' in out.lower() or \
                    set(PH.findall(enval)) != set(PH.findall(out)):
                return enval
            return out
        except TransError as e:
            if not e.retryable:
                return enval
            time.sleep(min(delay, 45))
            delay *= 2
    return enval


def translate_batch(strings, tl):
    """Translate many *single-sentence* strings in ONE request.

    Returns a list aligned with `strings` where each item is the translation, or
    None when that particular string came back with mangled placeholders (the
    caller then retries just that one). Returns None for the whole batch when the
    request failed or the segment count did not line up.
    """
    prot, stores = [], []
    for s in strings:
        p, st = protect(s)
        prot.append(p.replace('\n', ' ').strip())
        stores.append(st)
    segs = translate_sentences(prot, tl)
    out = []
    for orig, seg, st in zip(strings, segs, stores):
        r = restore(seg, st)
        if not r or 'xqx' in r.lower() or \
                set(PH.findall(orig)) != set(PH.findall(r)):
            out.append(None)
        else:
            out.append(r)
    return out


def batch_worker(strings, tl, depth=0):
    """Translate a batch; split on segment drift, back off only on real net errors."""
    delay = RETRY_BASE
    for _ in range(3):
        try:
            res = translate_batch(strings, tl)
        except TransError as e:
            if e.kind == 'seg' or not e.retryable:
                break            # deterministic: only splitting can fix it
            time.sleep(min(delay, 45))
            delay *= 2
            continue
        return {
            t: (v if v is not None else translate_one(t, tl))
            for t, v in zip(strings, res)
        }
    if len(strings) > 1 and depth < 8:
        mid = len(strings) // 2
        out = batch_worker(strings[:mid], tl, depth + 1)
        out.update(batch_worker(strings[mid:], tl, depth + 1))
        return out
    return {t: translate_one(t, tl) for t in strings}


def pack_batches(strings):
    """Group strings into request-sized batches (count and char capped)."""
    batches, cur, size = [], [], 0
    for s in strings:
        if cur and (len(cur) >= BATCH_STRINGS or size + len(s) > BATCH_CHARS):
            batches.append(cur)
            cur, size = [], 0
        cur.append(s)
        size += len(s) + 1
    if cur:
        batches.append(cur)
    return batches


def translate_string(enval, tl):
    """Multi-sentence values: one request for the whole string.

    Splitting a paragraph into sentences and stitching the pieces back together
    used to lose the original spacing and tripped the segment-count check, so the
    string now goes over intact - translate_one concatenates whatever segments
    come back.
    """
    return translate_one(enval, tl)


def main():
    cache = {}
    if CACHE_FILE.exists():
        cache = json.loads(CACHE_FILE.read_text(encoding='utf-8'))
    en_full = json.loads((M / f'{EN}.json').read_text(encoding='utf-8'))
    en = flatten(en_full)

    failed = []
    for loc in LOCALES:
      try:
        tl = TL.get(loc, loc)
        print(f"\n=== {loc} (tl={tl}) ===", flush=True)
        loc_full = json.loads((M / f'{loc}.json').read_text(encoding='utf-8'))
        locf = flatten(loc_full)
        todo = []
        for path, enval in en.items():
            cur = locf.get(path, None)
            if cur is None:
                cur = enval
            if cur != enval:
                continue
            if not isinstance(enval, str) or enval == '':
                continue
            if ICU.search(enval):
                continue
            if NOLETTER.search(enval):
                continue
            if formula_only(enval):
                continue
            todo.append((path, enval))
        print(f"  keys to translate: {len(todo)}", flush=True)

        uniq = list(dict.fromkeys([v for _, v in todo]))
        lcache = cache.setdefault(loc, {})
        missing = [t for t in uniq if t not in lcache]
        # single-sentence strings can share one request; multi-sentence ones
        # cannot (Google would return a different number of segments).
        single, multi = [], []
        for t in missing:
            prot, _ = protect(t)
            if '\n' not in t and len(split_sentences(prot)) <= 1:
                single.append(t)
            else:
                multi.append(t)
        batches = pack_batches(single)
        print(f"  unique: {len(uniq)}, cached: {len(uniq) - len(missing)}, "
              f"to fetch: {len(missing)} -> {len(batches)} batched requests "
              f"+ {len(multi)} single", flush=True)

        done_local = 0
        total_local = len(missing)
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futs = {}
            for b in batches:
                futs[ex.submit(batch_worker, b, tl)] = ('batch', b)
            for t in multi:
                futs[ex.submit(translate_string, t, tl)] = ('one', t)
            for fut in as_completed(futs):
                kind, payload = futs[fut]
                try:
                    if kind == 'batch':
                        lcache.update(fut.result())
                    else:
                        lcache[payload] = fut.result()
                except Exception:
                    if kind == 'batch':
                        for t in payload:
                            lcache.setdefault(t, t)
                    else:
                        lcache[payload] = payload
                done_local += len(payload) if kind == 'batch' else 1
                if done_local % CACHE_EVERY < (len(payload) if kind == 'batch' else 1):
                    atomic_write(CACHE_FILE, json.dumps(cache, ensure_ascii=False))
                    print(f"  [{loc}] {done_local}/{total_local}", flush=True)

        # apply translations back
        for path, enval in todo:
            locf[path] = lcache.get(enval, enval)
        merged = unflatten(locf)
        ok = atomic_write(M / f'{loc}.json',
                          json.dumps(merged, ensure_ascii=False, indent=2) + '\n')
        atomic_write(CACHE_FILE, json.dumps(cache, ensure_ascii=False))
        translated = sum(1 for k, v in lcache.items() if v != k)
        if ok:
            print(f"  -> wrote {loc}.json ({translated}/{len(lcache)} translated)", flush=True)
        else:
            failed.append(loc)
            print(f"  -> {loc}.json NOT written (cache kept, re-run will apply)", flush=True)
      except Exception as e:
        # never let one locale kill the whole run; cache is already on disk
        failed.append(loc)
        print(f"  !! {loc} ABORTED: {type(e).__name__} {e}", flush=True)
        atomic_write(CACHE_FILE, json.dumps(cache, ensure_ascii=False))

    if failed:
        print(f"\nFAILED LOCALES: {', '.join(failed)}", flush=True)
    print("\nDONE", flush=True)


if __name__ == '__main__':
    main()
