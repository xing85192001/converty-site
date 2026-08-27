#!/usr/bin/env python3
"""Re-translate any disclaimer / advertisement label still equal to English.

The earlier batch run fell back to English for all non-zh locales (multi-q parse
bug + interruption). This translates ONE text per request (clean response
structure) and only writes when the result actually differs from English.
zh / zh-TW are skipped (hand-written Chinese already in place).
"""
import json
import os
import time
import urllib.parse
import urllib.request
from pathlib import Path

MSG_DIR = Path(__file__).resolve().parent.parent / "src" / "messages"
EN = json.load(open(MSG_DIR / "en.json", encoding="utf-8"))
EN_DISCLAIMERS = EN["disclaimers"]
EN_AD = EN["common"]["advertisement"]

SKIP = {"en", "zh", "zh-TW"}


def translate_one(text, tl):
    q = urllib.parse.quote(text)
    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl=en&tl={tl}&dt=t&q={q}"
    )
    for endpoint in (
        "https://translate.googleapis.com/translate_a/single",
        "https://clients5.google.com/translate_a/t",
    ):
        u = f"{endpoint}?client=gtx&sl=en&tl={tl}&dt=t&q={q}"
        for _ in range(3):
            try:
                req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
                data = json.loads(urllib.request.urlopen(req, timeout=20).read().decode())
                out = "".join(seg[0] for seg in data[0] if seg and seg[0])
                if out and out != text:
                    return out
            except Exception:
                pass
            time.sleep(0.6)
    return None


def write(locale, data):
    path = MSG_DIR / f"{locale}.json"
    tmp = path.with_suffix(".json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def main():
    for p in sorted(MSG_DIR.glob("*.json")):
        loc = p.stem
        if loc in SKIP:
            continue
        d = json.load(open(p, encoding="utf-8"))
        disc = d.setdefault("disclaimers", {})
        changed = False
        for k, en_val in EN_DISCLAIMERS.items():
            if disc.get(k, "").strip() == en_val.strip():
                print(f"{loc}: translating disclaimers.{k} ...")
                res = translate_one(en_val, loc)
                if res:
                    disc[k] = res
                    changed = True
                    print(f"  -> {res[:50]!r}")
                else:
                    print(f"  !! kept English for {loc}.disclaimers.{k}")
        # advertisement label
        ad = d.get("common", {}).get("advertisement", "")
        if ad.strip() == EN_AD.strip():
            res = translate_one(EN_AD, loc)
            if res:
                d.setdefault("common", {})["advertisement"] = res
                changed = True
                print(f"{loc}: advertisement -> {res!r}")
        if changed:
            write(loc, d)


if __name__ == "__main__":
    main()
    print("done")
