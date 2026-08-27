#!/usr/bin/env python3
"""Merge extracted tool feature translations into src/messages/{locale}.json.
Only keeps toolFeatures.highlights + toolFeatures.core (the layout stays in code).
"""
import json
from pathlib import Path

LOCALES = ["en", "ar", "cs", "de", "el", "es", "fr", "hu", "id", "it", "ja", "ko", "ms", "nl", "pt", "ru", "th", "tr", "uk", "vi", "zh", "zh-TW"]
MESSAGES_DIR = Path("src/messages")


def deep_merge(base: dict, overlay: dict) -> dict:
    for k, v in overlay.items():
        if isinstance(v, dict) and k in base and isinstance(base[k], dict):
            deep_merge(base[k], v)
        else:
            base[k] = v
    return base


def main():
    for loc in LOCALES:
        msg_path = MESSAGES_DIR / f"{loc}.json"
        data = json.loads(msg_path.read_text(encoding="utf-8"))
        extracted_path = Path(f"scripts/_tool_features_{loc}.json")
        if extracted_path.exists():
            extracted = json.loads(extracted_path.read_text(encoding="utf-8"))
            tf = extracted.get("toolFeatures", {})
            overlay = {
                "toolFeatures": {
                    "highlights": tf.get("highlights", {}),
                    "core": tf.get("core", {}),
                }
            }
            data = deep_merge(data, overlay)
            msg_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"Injected {loc}: {len(overlay['toolFeatures']['highlights'])} highlights, {len(overlay['toolFeatures']['core'])} core strings")


if __name__ == "__main__":
    main()
