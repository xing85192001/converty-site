#!/usr/bin/env python3
"""Scan all locale JSON files for translation damage.

Damage patterns:
1. Chinese characters in non-Chinese locale files.
2. Latin letters split by CJK characters in any locale (e.g. "c材料erials").
3. Common Chinese fragments appearing inside Latin text in any locale.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "src" / "messages"

CJK = re.compile(r"[\u4e00-\u9fff]")
LATIN_SPLIT_BY_CJK = re.compile(r"[a-zA-Z][\u4e00-\u9fff]+[a-zA-Z]")
SUSPICIOUS_FRAGMENTS = ["材料", "人工", "制造", "销售", "贷款", "利润", "成本", "利率", "直接", "运营", "手续"]


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
    files = sorted(MESSAGES.glob("*.json"))
    files = [f for f in files if f.name != "_t.json"]
    en_file = MESSAGES / "en.json"
    en = json.loads(en_file.read_text(encoding="utf-8"))
    en_flat = flatten(en)

    report = []
    for f in files:
        locale = f.stem
        data = json.loads(f.read_text(encoding="utf-8"))
        flat = flatten(data)

        damaged_keys = []
        for key, val in flat.items():
            if not val:
                continue
            reasons = []
            # 1. Chinese chars in non-Chinese locale
            if locale not in ("zh", "zh-TW") and CJK.search(val):
                reasons.append("chinese_chars_in_non_chinese_locale")
            # 2. Latin letters split by CJK characters (the clearest damage signature)
            if LATIN_SPLIT_BY_CJK.search(val):
                reasons.append("latin_split_by_cjk")
            # 3. Common Chinese fragments mixed with Latin text
            for frag in SUSPICIOUS_FRAGMENTS:
                if frag in val and re.search(r"[a-zA-Z]", val):
                    reasons.append(f"fragment:{frag}")
                    break
            if reasons:
                damaged_keys.append((key, val, reasons))

        if damaged_keys:
            report.append((locale, damaged_keys))

    total_damaged = sum(len(d) for _, d in report)
    print(f"Total damaged entries: {total_damaged} across {len(report)} locales")
    for locale, keys in report:
        print(f"\n=== {locale}.json ({len(keys)} damaged) ===")
        for key, val, reasons in keys[:100]:
            print(f"  {key}")
            print(f"    reasons: {', '.join(reasons)}")
            print(f"    value: {val[:200]!r}")
        if len(keys) > 100:
            print(f"  ... and {len(keys) - 100} more")

    out = ROOT / "scripts" / "i18n_damage_report.json"
    out.write_text(
        json.dumps(
            [{"locale": loc, "keys": [{"key": k, "value": v, "reasons": r} for k, v, r in keys]} for loc, keys in report],
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"\nDetailed report saved to {out}")


if __name__ == "__main__":
    main()
