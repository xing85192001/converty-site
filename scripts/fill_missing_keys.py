#!/usr/bin/env python3
"""Fill missing keys in all locale files with English fallback."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "src" / "messages"


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


def merge(target, source):
    if isinstance(target, dict) and isinstance(source, dict):
        for k, v in source.items():
            if k not in target:
                target[k] = v
            else:
                merge(target[k], v)


def main():
    en = json.loads((MESSAGES / "en.json").read_text(encoding="utf-8"))
    files = sorted(MESSAGES.glob("*.json"))
    files = [f for f in files if f.name != "_t.json"]

    for f in files:
        if f.stem == "en":
            continue
        data = json.loads(f.read_text(encoding="utf-8"))
        merge(data, en)
        f.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Filled missing keys in {f.name}")


if __name__ == "__main__":
    main()
