"""Merge the generated UI translations into every locale message file.

Reads scripts/_hardcoded.json (slug -> English phrase, minus the two IP
examples) and scripts/ui_translations_cache.json (locale -> slug -> text).
Writes the `ui` namespace into src/messages/<locale>.json:
  - en.json  : ui[slug] = English phrase (source of truth)
  - others   : ui[slug] = translated text (falls back to English if missing)
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HARD = os.path.join(ROOT, "scripts", "_hardcoded.json")
CACHE = os.path.join(ROOT, "scripts", "ui_translations_cache.json")
MSG_DIR = os.path.join(ROOT, "src", "messages")

SKIP_SLUGS = {
    "192-168-1-50-or-2001-db8-1",
    "192-168-1-1-or-2001-db8-1",
}


def main():
    with open(HARD, encoding="utf-8") as f:
        hard = json.load(f)
    with open(CACHE, encoding="utf-8") as f:
        cache = json.load(f)

    en_phrases = {p["slug"]: p["phrase"] for p in hard["phrases"] if p["slug"] not in SKIP_SLUGS}

    locales = sorted(
        f[:-5] for f in os.listdir(MSG_DIR) if f.endswith(".json") and f != "CLAUDE.md"
    )
    print("Locales:", locales)

    for loc in locales:
        path = os.path.join(MSG_DIR, f"{loc}.json")
        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        existing_ui = data.get("ui", {})
        ui = dict(existing_ui)
        source = en_phrases if loc == "en" else cache.get(loc, {})
        missing = 0
        for slug, phrase in en_phrases.items():
            if slug in ui and ui[slug]:
                continue
            val = source.get(slug)
            if not val:
                val = phrase  # fallback to English
                missing += 1
            ui[slug] = val
        data["ui"] = ui

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")

        print(f"[ok] {loc}: ui has {len(ui)} keys (fallback={missing})")


if __name__ == "__main__":
    main()
