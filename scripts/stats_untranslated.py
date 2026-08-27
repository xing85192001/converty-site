#!/usr/bin/env python3
"""Show untranslated key counts per locale vs en.json."""
import json
from pathlib import Path
from collections import defaultdict

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


def main():
    en = json.loads((MESSAGES / "en.json").read_text(encoding="utf-8"))
    en_flat = flatten(en)
    files = sorted(MESSAGES.glob("*.json"))
    files = [f for f in files if f.name not in ("_t.json", "en.json")]

    by_locale = {}
    for f in files:
        loc = f.stem
        data = json.loads(f.read_text(encoding="utf-8"))
        flat = flatten(data)
        same = []
        missing = []
        for k, en_val in en_flat.items():
            if k not in flat:
                missing.append(k)
            elif flat[k] == en_val:
                same.append(k)
        by_locale[loc] = {"same": same, "missing": missing}

    print("Locale | Missing | Same-as-English | Total en keys")
    for loc in sorted(by_locale):
        s = by_locale[loc]
        print(f"{loc:7} | {len(s['missing']):7} | {len(s['same']):15} | {len(en_flat)}")

    # Show namespaces with most same-as-English across all locales
    ns_counts = defaultdict(lambda: defaultdict(int))
    for loc, s in by_locale.items():
        for k in s["same"]:
            ns = k.split(".")[0]
            ns_counts[ns][loc] += 1

    print("\nTop namespaces by same-as-English count (sum across locales):")
    for ns, locs in sorted(ns_counts.items(), key=lambda x: -sum(x[1].values()))[:20]:
        print(f"  {ns}: {sum(locs.values())}")

    # Save per-locale first 100 same keys
    out = ROOT / "scripts" / "untranslated_report.json"
    out.write_text(
        json.dumps(
            {loc: {"same": s["same"][:200], "missing": s["missing"][:200]} for loc, s in by_locale.items()},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"\nSaved report to {out}")


if __name__ == "__main__":
    main()
