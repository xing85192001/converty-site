#!/usr/bin/env python
"""Add a `name` label to calculator sub-namespaces that currently only contain
`steps`, copying the already-translated display name from the `converter`
namespace. This fixes INSUFFICIENT_PATH errors where components call
tCategory("<calcName>") and the key resolves to a namespace (object).

Mapping: (top, category, sub-namespace) -> converter id whose `.name` holds the
human-readable English label (already translated in every locale).
"""
import json
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "src", "messages")

LOCALES = [
    "ar", "cs", "de", "el", "en", "es", "fr", "hu", "id", "it", "ja", "ko",
    "ms", "nl", "pt", "ru", "th", "tr", "uk", "vi", "zh", "zh-TW",
]

# (namespace path tuple) -> converter id
MAPPING = {
    ("calculator", "math", "area"): "area-calculator",
    ("calculator", "math", "bigNumber"): "big-number",
    ("calculator", "math", "confidenceInterval"): "confidence-interval",
    ("calculator", "math", "sampleSize"): "sample-size",
    ("calculator", "math", "scientificNotation"): "scientific-notation",
    ("calculator", "math", "halfLife"): "half-life-calculator",
    ("calculator", "math", "matrix"): "matrix-calculator",
    ("calculator", "math", "numberSequence"): "number-sequence",
    ("calculator", "math", "pValue"): "p-value-calculator",
    ("calculator", "math", "probability"): "probability-calculator",
    ("calculator", "math", "fraction"): "fraction-calculator",
    ("calculator", "math", "zScore"): "z-score-calculator",
    ("calculator", "math", "distance"): "distance-calculator",
    ("calculator", "math", "slope"): "slope-calculator",
    ("calculator", "math", "surfaceArea"): "surface-area-calculator",
    ("calculator", "math", "volume"): "volume-calculator",
    ("calculator", "network", "bdp"): "bandwidth-delay-product",
}


def get_nested(node, path):
    for p in path:
        if not isinstance(node, dict):
            return None
        node = node.get(p)
    return node


def set_nested(node, path, value):
    for p in path[:-1]:
        node = node.setdefault(p, {})
    node[path[-1]] = value


def main():
    # English reference names
    with open(os.path.join(BASE, "en.json"), encoding="utf-8") as f:
        en = json.load(f)
    english_names = {}
    for path, cid in MAPPING.items():
        conv = get_nested(en, ("converter", cid))
        name = conv.get("name") if isinstance(conv, dict) else None
        english_names[path] = name or path[-1]

    for loc in LOCALES:
        fp = os.path.join(BASE, f"{loc}.json")
        with open(fp, encoding="utf-8") as f:
            data = json.load(f)
        for path, cid in MAPPING.items():
            conv = get_nested(data, ("converter", cid))
            name = conv.get("name") if isinstance(conv, dict) else None
            if not name:
                name = english_names[path]
            set_nested(data, path + ("name",), name)
        with open(fp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")

    # verify
    print("Added name to", len(MAPPING), "sub-namespaces across", len(LOCALES), "locales")
    with open(os.path.join(BASE, "en.json"), encoding="utf-8") as f:
        en2 = json.load(f)
    for path, _ in MAPPING.items():
        v = get_nested(en2, path + ("name",))
        print(f"  {'.'.join(path)}.name = {v!r}")


if __name__ == "__main__":
    main()
