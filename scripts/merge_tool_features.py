#!/usr/bin/env python3
"""Merge _tool_features.json into each locale message file.

English and Chinese get their own translations; all other locales fall back
to English so the page never shows a missing-key error.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "src" / "messages"
SRC = MESSAGES / "_tool_features.json"


def deep_merge(base, addition):
    if isinstance(base, dict) and isinstance(addition, dict):
        for k, v in addition.items():
            if k in base:
                base[k] = deep_merge(base[k], v)
            else:
                base[k] = v
        return base
    return addition


def strip_locale(obj, loc: str):
    """Convert {"title": {"en": ..., "zh": ...}} -> {"title": value_for_locale}."""
    if isinstance(obj, dict):
        # If this dict only contains locale keys, return the requested locale
        if all(isinstance(k, str) and k in ("en", "zh", "zh-TW") for k in obj.keys()):
            if loc in obj:
                return obj[loc]
            if loc == "zh-TW" and "zh" in obj:
                return obj["zh"]
            return obj.get("en", "")
        return {k: strip_locale(v, loc) for k, v in obj.items()}
    if isinstance(obj, list):
        return [strip_locale(v, loc) for v in obj]
    return obj


def main():
    src = json.loads(SRC.read_text(encoding="utf-8"))

    for f in sorted(MESSAGES.glob("*.json")):
        if f.name in ("_t.json", "_tool_features.json"):
            continue
        loc = f.stem
        data = json.loads(f.read_text(encoding="utf-8"))
        localized = strip_locale(src, loc)
        data = deep_merge(data, localized)
        f.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Merged toolFeatures into {f.name}")


if __name__ == "__main__":
    main()
