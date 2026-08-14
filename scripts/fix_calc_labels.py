#!/usr/bin/env python
"""Rewrite tMath("<namespace>") -> tMath("<namespace>.name") for the 16 math
sub-namespaces (and t("bdp") -> t("bdp.name") for the network one), which are
label keys that currently resolve to a namespace object (INSUFFICIENT_PATH).
"""
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "src")

MATH_KEYS = [
    "area", "bigNumber", "confidenceInterval", "sampleSize",
    "scientificNotation", "halfLife", "matrix", "numberSequence", "pValue",
    "probability", "fraction", "zScore", "distance", "slope", "surfaceArea",
    "volume",
]

# file -> list of (old, new) exact string replacements
REPLACEMENTS = [
    ("tMath(\"%s\")" % k, "tMath(\"%s.name\")" % k) for k in MATH_KEYS
]
REPLACEMENTS.append(("t(\"bdp\")", "t(\"bdp.name\")"))

changed_files = 0
total = 0
for root, _, files in os.walk(BASE):
    for fn in files:
        if not fn.endswith(".tsx"):
            continue
        fp = os.path.join(root, fn)
        with open(fp, encoding="utf-8") as f:
            src = f.read()
        orig = src
        for old, new in REPLACEMENTS:
            src = src.replace(old, new)
        if src != orig:
            with open(fp, "w", encoding="utf-8") as f:
                f.write(src)
            cnt = sum(1 for old, _ in REPLACEMENTS if old in orig)
            changed_files += 1
            total += cnt
            print(f"  {os.path.relpath(fp, BASE)} ({cnt} repls)")

print(f"Changed {changed_files} files, {total} replacements")
