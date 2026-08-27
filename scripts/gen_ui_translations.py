"""Generate UI-namespace translations for the hardcoded phrases.

Uses ONE phrase per request (the batch endpoint splits sentences on internal
punctuation, breaking the 1:1 mapping). A thread pool parallelizes requests and
results are cached per-phrase in scripts/ui_translations_cache.json so the run
is resumable across network failures.

The two IP-example phrases are excluded (kept literal in source).
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HARD = os.path.join(ROOT, "scripts", "_hardcoded.json")
CACHE = os.path.join(ROOT, "scripts", "ui_translations_cache.json")

TARGET_LOCALES = [
    "ar", "cs", "de", "el", "es", "fr", "hu", "id", "it", "ja", "ko",
    "ms", "nl", "pt", "ru", "th", "tr", "uk", "vi", "zh", "zh-TW",
]

TL_MAP = {
    "ar": "ar", "cs": "cs", "de": "de", "el": "el", "es": "es", "fr": "fr",
    "hu": "hu", "id": "id", "it": "it", "ja": "ja", "ko": "ko", "ms": "ms",
    "nl": "nl", "pt": "pt", "ru": "ru", "th": "th", "tr": "tr", "uk": "uk",
    "vi": "vi", "zh": "zh", "zh-TW": "zh-TW",
}

SKIP_SLUGS = {
    "192-168-1-50-or-2001-db8-1",
    "192-168-1-1-or-2001-db8-1",
}

WORKERS = 6


def load_phrases():
    with open(HARD, encoding="utf-8") as f:
        data = json.load(f)
    return [(p["slug"], p["phrase"]) for p in data["phrases"] if p["slug"] not in SKIP_SLUGS]


def fetch_one(phrase, tl):
    q = urllib.parse.quote(phrase)
    url = (
        "https://translate.googleapis.com/translate_a/single?client=gtx"
        "&sl=en&dt=t&q=" + q + "&tl=" + tl
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode())
    groups = data[0]
    parts = []
    for g in groups:
        if isinstance(g, list) and g and isinstance(g[0], str):
            parts.append(g[0])
    text = "".join(parts).strip()
    return text


def translate_locale(phrases, tl, existing):
    todo = [(s, p) for (s, p) in phrases if s not in existing or not existing.get(s)]
    result = dict(existing)

    def work(item):
        slug, phrase = item
        last_err = None
        for _ in range(4):
            try:
                return slug, fetch_one(phrase, tl)
            except Exception as e:  # noqa
                last_err = e
                time.sleep(1.5)
        return slug, None

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = [ex.submit(work, it) for it in todo]
        done = 0
        for f in as_completed(futs):
            slug, text = f.result()
            if text:
                result[slug] = text
            done += 1
            if done % 20 == 0:
                print(f"    {done}/{len(todo)} done")
    return result


def main():
    test = "--test" in sys.argv
    phrases = load_phrases()
    print(f"Translatable phrases: {len(phrases)}")

    cache = {}
    if os.path.exists(CACHE):
        with open(CACHE, encoding="utf-8") as f:
            cache = json.load(f)

    locales = (["de", "fr"] if test else TARGET_LOCALES)

    for loc in locales:
        existing = cache.get(loc, {})
        have = sum(1 for s, _ in phrases if existing.get(s))
        if have == len(phrases):
            print(f"[skip] {loc} complete ({have})")
            continue
        print(f"[start] {loc}: {have}/{len(phrases)} cached, translating rest...")
        cache[loc] = translate_locale(phrases, TL_MAP[loc], existing)
        # persist after each locale so progress survives interruptions
        with open(CACHE, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        got = sum(1 for s, _ in phrases if cache[loc].get(s))
        print(f"[done] {loc}: {got}/{len(phrases)} translated")

    with open(CACHE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    print("Cache written:", CACHE)


if __name__ == "__main__":
    main()
