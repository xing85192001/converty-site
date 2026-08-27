#!/usr/bin/env python
"""Translate untranslated `converter.*.name` / `converter.*.description` values
into every non-English locale.

An entry is considered untranslated when its value equals the English source
(which means the earlier translation rounds skipped it). We translate each
unique English string once per locale (dedup), one phrase per request, with a
resumable per-(locale, text) cache in scripts/converter_translations_cache.json.
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MSG = os.path.join(ROOT, "src", "messages")
CACHE = os.path.join(ROOT, "scripts", "converter_translations_cache.json")

LOCALES = [
    "ar", "cs", "de", "el", "es", "fr", "hu", "id", "it", "ja", "ko",
    "ms", "nl", "pt", "ru", "th", "tr", "uk", "vi", "zh", "zh-TW",
]

TL_MAP = {
    "ar": "ar", "cs": "cs", "de": "de", "el": "el", "es": "es", "fr": "fr",
    "hu": "hu", "id": "id", "it": "it", "ja": "ja", "ko": "ko", "ms": "ms",
    "nl": "nl", "pt": "pt", "ru": "ru", "th": "th", "tr": "tr", "uk": "uk",
    "vi": "vi", "zh": "zh", "zh-TW": "zh-TW",
}

WORKERS = 3


def load_en():
    with open(os.path.join(MSG, "en.json"), encoding="utf-8") as f:
        return json.load(f)["converter"]


def collect_targets(en_conv):
    """Return {locale: set(english_strings_needing_translation)}."""
    targets = {}
    for loc in LOCALES:
        with open(os.path.join(MSG, f"{loc}.json"), encoding="utf-8") as f:
            conv = json.load(f).get("converter", {})
        need = set()
        for cid, v in en_conv.items():
            if not isinstance(v, dict):
                continue
            node = conv.get(cid)
            if not isinstance(node, dict):
                continue
            en_name = v.get("name")
            if en_name and node.get("name") == en_name:
                need.add(en_name)
            en_desc = v.get("description")
            if en_desc and node.get("description") == en_desc:
                need.add(en_desc)
        targets[loc] = need
    return targets


def fetch_one(text, tl):
    q = urllib.parse.quote(text)
    url = (
        "https://translate.googleapis.com/translate_a/single?client=gtx"
        "&sl=en&dt=t&q=" + q + "&tl=" + tl
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode())
    parts = []
    for g in data[0]:
        if isinstance(g, list) and g and isinstance(g[0], str):
            parts.append(g[0])
    return "".join(parts).strip()


def translate_locale(need, tl, existing):
    todo = [t for t in need if t not in existing or not existing.get(t)]
    result = dict(existing)

    def work(text):
        time.sleep(0.4)  # pace requests to avoid triggering the rate limit
        for attempt in range(8):
            try:
                return text, fetch_one(text, tl)
            except Exception:  # noqa
                time.sleep(min(1.5 * (2 ** attempt), 20.0))
        return text, None

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = [ex.submit(work, t) for t in todo]
        done = 0
        for f in as_completed(futs):
            text, translated = f.result()
            if translated:
                result[text] = translated
            done += 1
            if done % 50 == 0:
                print(f"    {done}/{len(todo)}", flush=True)
    return result


def apply_translations(en_conv, cache):
    """Write translated names/descriptions back into each locale file."""
    changed = 0
    for loc in LOCALES:
        fp = os.path.join(MSG, f"{loc}.json")
        with open(fp, encoding="utf-8") as f:
            data = json.load(f)
        conv = data.get("converter", {})
        loc_cache = cache.get(loc, {})
        for cid, v in en_conv.items():
            if not isinstance(v, dict):
                continue
            node = conv.get(cid)
            if not isinstance(node, dict):
                continue
            en_name = v.get("name")
            if en_name and node.get("name") == en_name and loc_cache.get(en_name):
                node["name"] = loc_cache[en_name]
                changed += 1
            en_desc = v.get("description")
            if en_desc and node.get("description") == en_desc and loc_cache.get(en_desc):
                node["description"] = loc_cache[en_desc]
                changed += 1
        with open(fp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
    return changed


def main():
    test = "--test" in sys.argv
    en_conv = load_en()
    targets = collect_targets(en_conv)
    total = sum(len(v) for v in targets.values())
    print(f"Unique untranslated strings to translate: {total}")

    cache = {}
    if os.path.exists(CACHE):
        with open(CACHE, encoding="utf-8") as f:
            cache = json.load(f)

    locales = (["de", "fr"] if test else LOCALES)
    for loc in locales:
        need = targets[loc]
        existing = cache.get(loc, {})
        have = sum(1 for t in need if existing.get(t))
        if have == len(need) and need:
            print(f"[skip] {loc} complete ({have})", flush=True)
            continue
        print(f"[start] {loc}: {have}/{len(need)} cached", flush=True)
        cache[loc] = translate_locale(need, TL_MAP[loc], existing)
        with open(CACHE, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        got = sum(1 for t in need if cache[loc].get(t))
        print(f"[done] {loc}: {got}/{len(need)}", flush=True)

    with open(CACHE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    if not test:
        changed = apply_translations(en_conv, cache)
        print(f"Applied translations: {changed} fields updated")


if __name__ == "__main__":
    main()
