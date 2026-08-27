#!/usr/bin/env python3
"""Fix Chinese (zh.json) entries where Latin words are split by CJK characters."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "src" / "messages"

LATIN_SPLIT_BY_CJK = re.compile(r"[a-zA-Z][\u4e00-\u9fff]+[a-zA-Z]")


def flatten(obj, prefix=""):
    items = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            items.update(flatten(v, f"{prefix}.{k}" if prefix else k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            items.update(flatten(v, f"{prefix}[{i}]"))
    elif isinstance(obj, str):
        items[prefix] = obj
    return items


def unflatten(flat):
    out = {}
    for key, val in flat.items():
        parts = key.split(".")
        cur = out
        for p in parts[:-1]:
            if p not in cur or not isinstance(cur[p], dict):
                cur[p] = {}
            cur = cur[p]
        cur[parts[-1]] = val
    return out


def main():
    en = json.loads((MESSAGES / "en.json").read_text(encoding="utf-8"))
    zh = json.loads((MESSAGES / "zh.json").read_text(encoding="utf-8"))
    en_flat = flatten(en)
    zh_flat = flatten(zh)

    fixed = 0
    for key, val in zh_flat.items():
        if LATIN_SPLIT_BY_CJK.search(val):
            if key in en_flat:
                zh_flat[key] = en_flat[key]
                fixed += 1
            else:
                print(f"Warning: no en fallback for {key}: {val!r}")

    zh = unflatten(zh_flat)
    (MESSAGES / "zh.json").write_text(
        json.dumps(zh, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Fixed {fixed} corrupted entries in zh.json")


if __name__ == "__main__":
    main()
