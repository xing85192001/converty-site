#!/usr/bin/env python3
"""Add disclaimer + advertisement keys to all 22 locales and translate them.

English source texts are written to en.json; the other 21 locales are filled
via the Google translate endpoint (reachable from this sandbox). Keys added:
  - common.advertisement  ("Advertisement")
  - disclaimers.finance
  - disclaimers.health
  - disclaimers.crypto
"""
import json
import os
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MSG_DIR = ROOT / "src" / "messages"

EN_DISCLAIMERS = {
    "finance": (
        "Calculators on this site provide estimates for general informational "
        "purposes only. They are not financial, investment, tax, or legal advice. "
        "Consult a qualified professional before making any decision."
    ),
    "health": (
        "These calculators provide general information only and are not a substitute "
        "for professional medical advice, diagnosis, or treatment. Always consult a "
        "qualified healthcare provider."
    ),
    "crypto": (
        "These tools are for educational and informational purposes only. They are not "
        "investment, trading, or financial advice. Cryptocurrency involves significant "
        "risk \u2014 always do your own research."
    ),
}
EN_ADVERTISEMENT = "Advertisement"

# locales we need to translate (everything except en)
EN = json.load(open(MSG_DIR / "en.json", encoding="utf-8"))
OTHER_LOCALES = [p.stem for p in MSG_DIR.glob("*.json") if p.stem != "en"]


def translate_list(texts, tl):
    """Translate a list of strings into language `tl`. Returns list of results."""
    if not texts:
        return []
    q = "".join(f"&q={urllib.parse.quote(t)}" for t in texts)
    url = (
        "https://translate.googleapis.com/translate_a/single?client=gtx"
        f"&sl=en&tl={tl}&dt=t{q}"
    )
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.loads(r.read().decode("utf-8"))
            out = []
            for sent in data[0]:
                out.append("".join(seg[0] for seg in sent if seg and seg[0]))
            if len(out) == len(texts):
                return out
        except Exception:
            pass
        # fallback to clients5
        try:
            url2 = (
                "https://clients5.google.com/translate_a/t?client=gtx"
                f"&sl=en&tl={tl}&dt=t{q}"
            )
            req = urllib.request.Request(url2, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.loads(r.read().decode("utf-8"))
            out = []
            for sent in data[0]:
                out.append("".join(seg[0] for seg in sent if seg and seg[0]))
            if len(out) == len(texts):
                return out
        except Exception:
            pass
        time.sleep(1.5 * (attempt + 1))
    # give up -> return english so the key still exists
    return list(texts)


def write(locale, data):
    path = MSG_DIR / f"{locale}.json"
    tmp = path.with_suffix(".json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def main():
    # 1) English source
    en = EN
    en.setdefault("common", {})["advertisement"] = EN_ADVERTISEMENT
    en["disclaimers"] = dict(EN_DISCLAIMERS)
    write("en", en)
    print("en.json updated (source)")

    # 2) Other locales
    for loc in sorted(OTHER_LOCALES):
        d = json.load(open(MSG_DIR / f"{loc}.json", encoding="utf-8"))
        d.setdefault("common", {})["advertisement"] = EN_ADVERTISEMENT
        keys = list(EN_DISCLAIMERS.keys())
        src = [EN_DISCLAIMERS[k] for k in keys]
        translated = translate_list(src, loc)
        disc = dict(zip(keys, translated))
        d["disclaimers"] = disc
        write(loc, d)
        print(f"{loc}: disclaimers + advertisement written")

    # 3) Validate
    problems = []
    for p in MSG_DIR.glob("*.json"):
        loc = p.stem
        d = json.load(open(p, encoding="utf-8"))
        common = d.get("common", {})
        disc = d.get("disclaimers", {})
        if common.get("advertisement") != EN_ADVERTISEMENT:
            problems.append(f"{loc}: advertisement mismatch")
        for k in EN_DISCLAIMERS:
            if k not in disc or not disc[k].strip():
                problems.append(f"{loc}: missing disclaimers.{k}")
    if problems:
        print("PROBLEMS:")
        for pr in problems:
            print("  ", pr)
    else:
        print(f"OK: all {len(list(MSG_DIR.glob('*.json')))} locales have disclaimers + advertisement")


if __name__ == "__main__":
    main()
