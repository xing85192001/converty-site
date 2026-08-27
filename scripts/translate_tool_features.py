#!/usr/bin/env python3
"""Translate toolFeatures strings from en.json to all locales missing them.
Uses batch translation from translate_all.py for speed.
"""
import json
import re
from pathlib import Path

import importlib.util

spec = importlib.util.spec_from_file_location("tr", "scripts/translate_all.py")
tr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tr)

LOCALES = ["ar", "cs", "de", "el", "es", "fr", "hu", "it", "ja", "ko", "ms", "nl", "pt", "ru", "th", "tr", "uk"]
MESSAGES_DIR = Path("src/messages")

TL_MAP = {
    "zh": "zh-CN",
    "zh-TW": "zh-TW",
    "ms": "ms",
}


def extract_strings(en_tf: dict) -> list[str]:
    """Return all title/description strings in deterministic order."""
    strings = []
    for key in sorted(en_tf["highlights"].keys()):
        strings.append(en_tf["highlights"][key]["title"])
        strings.append(en_tf["highlights"][key]["description"])
    for key in sorted(en_tf["core"].keys()):
        strings.append(en_tf["core"][key]["title"])
        strings.append(en_tf["core"][key]["description"])
    return strings


def main():
    en = json.loads((MESSAGES_DIR / "en.json").read_text(encoding="utf-8"))["toolFeatures"]
    source_strings = extract_strings(en)

    for loc in LOCALES:
        msg_path = MESSAGES_DIR / f"{loc}.json"
        data = json.loads(msg_path.read_text(encoding="utf-8"))
        tf = data.setdefault("toolFeatures", {})
        tf["highlights"] = {}
        tf["core"] = {}

        tl = TL_MAP.get(loc, loc)
        print(f"Translating {loc} ({tl})...", flush=True)

        # Batch translate all unique source strings
        unique = list(dict.fromkeys(source_strings))
        mapping = tr.batch_worker(unique, tl)

        # Build reverse iterator
        it = iter(source_strings)
        for key in sorted(en["highlights"].keys()):
            tf["highlights"][key] = {
                "title": mapping[next(it)],
                "description": mapping[next(it)],
            }
        for key in sorted(en["core"].keys()):
            tf["core"][key] = {
                "title": mapping[next(it)],
                "description": mapping[next(it)],
            }

        msg_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  Done: {len(tf['highlights'])} highlights, {len(tf['core'])} core strings", flush=True)


if __name__ == "__main__":
    main()
