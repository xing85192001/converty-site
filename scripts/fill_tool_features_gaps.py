#!/usr/bin/env python3
"""Fill untranslated toolFeatures entries (title still equals English).

Only translates entries whose `title` matches the English source, leaving
already-translated entries untouched. Writes back with 2-space indent.
"""
import json
from pathlib import Path
import importlib.util

spec = importlib.util.spec_from_file_location("tr", "scripts/translate_all.py")
tr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tr)

MESSAGES = Path("src/messages")
LOCALES = ["ar", "cs", "de", "el", "es", "fr", "hu", "id", "it", "ja", "ko",
           "ms", "nl", "pt", "ru", "th", "tr", "uk", "vi", "zh", "zh-TW"]

TL_MAP = {"zh": "zh-CN", "zh-TW": "zh-TW", "ms": "ms"}


def main():
    en = json.loads((MESSAGES / "en.json").read_text(encoding="utf-8"))
    en_tf = en["toolFeatures"]

    total_fixed = 0
    for loc in LOCALES:
        path = MESSAGES / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        tf = data.setdefault("toolFeatures", {"core": {}, "highlights": {}})

        # collect untranslated source strings
        to_translate = []  # list of (section, key, field, en_text)
        for section in ("core", "highlights"):
            en_sec = en_tf.get(section, {})
            loc_sec = tf.setdefault(section, {})
            for key, env in en_sec.items():
                locv = loc_sec.setdefault(key, {})
                for field in ("title", "description"):
                    if locv.get(field) == env.get(field):
                        to_translate.append((section, key, field, env[field]))

        if not to_translate:
            continue

        # unique english strings
        srcs = sorted({t[3] for t in to_translate})
        tl = TL_MAP.get(loc, loc)
        mapping = tr.batch_worker(srcs, tl)
        # ensure every src has a non-empty translation
        for s in srcs:
            if not mapping.get(s):
                mapping[s] = s

        for section, key, field, en_text in to_translate:
            tf[section][key][field] = mapping.get(en_text, en_text)
        total_fixed += len(to_translate)

        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{loc}: fixed {len(to_translate)} toolFeatures fields")

    print(f"TOTAL fixed: {total_fixed}")


if __name__ == "__main__":
    main()
