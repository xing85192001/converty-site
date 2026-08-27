#!/usr/bin/env python
"""Diagnose which HEAD locale values for restored step paths are genuine translations."""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESTORED = json.loads((ROOT / "scripts" / "_restored_steps.json").read_text(encoding="utf-8"))

LOCALES = "ar cs de el es fr hu id it ja ko ms nl pt ru th tr uk vi zh zh-TW".split()

PLACEHOLDER = re.compile(r"\{(\w+)\}")
# scripts that are unambiguously non-Latin
NATIVE = {
    "ar": r"[\u0600-\u06FF]",
    "el": r"[\u0370-\u03FF]",
    "ja": r"[\u3040-\u30FF\u4E00-\u9FFF]",
    "ko": r"[\uAC00-\uD7AF]",
    "ru": r"[\u0400-\u04FF]",
    "th": r"[\u0E00-\u0E7F]",
    "uk": r"[\u0400-\u04FF]",
    "zh": r"[\u4E00-\u9FFF]",
    "zh-TW": r"[\u4E00-\u9FFF]",
}


def git_show(rev, path):
    out = subprocess.run(
        ["git", "show", f"{rev}:{path}"], cwd=ROOT, capture_output=True
    )
    if out.returncode != 0:
        return None
    return json.loads(out.stdout.decode("utf-8"))


def get_path(data, dotted):
    cur = data
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return None
        cur = cur[part]
    return cur if isinstance(cur, str) else None


def main():
    head_en = git_show("HEAD", "src/messages/en.json")
    summary = {}
    keep_map = {}
    for loc in LOCALES:
        head = git_show("HEAD", f"src/messages/{loc}.json")
        if head is None:
            print(f"!! cannot read HEAD {loc}")
            continue
        stats = dict(missing=0, eq_junk=0, eq_restored=0, translated=0,
                     ph_ok=0, ph_bad=0, native_ok=0, no_native=0)
        keep = {}
        samples = []
        for dotted, restored in RESTORED.items():
            hv = get_path(head, dotted)
            if hv is None:
                stats["missing"] += 1
                continue
            junk = get_path(head_en, dotted)
            if junk is not None and hv == junk:
                stats["eq_junk"] += 1
                continue
            if hv == restored:
                stats["eq_restored"] += 1
                continue
            stats["translated"] += 1
            want = set(PLACEHOLDER.findall(restored))
            got = set(PLACEHOLDER.findall(hv))
            ph_ok = got == want
            if ph_ok:
                stats["ph_ok"] += 1
            else:
                stats["ph_bad"] += 1
            nat = NATIVE.get(loc)
            has_native = bool(re.search(nat, hv)) if nat else None
            if nat:
                if has_native:
                    stats["native_ok"] += 1
                else:
                    stats["no_native"] += 1
            # decide keep
            ok = ph_ok and (has_native is not False)
            if ok:
                keep[dotted] = hv
                if len(samples) < 3:
                    samples.append((dotted, restored, hv))
        keep_map[loc] = keep
        summary[loc] = stats
        print(f"{loc:6s} keep={len(keep):4d} " + " ".join(f"{k}={v}" for k, v in stats.items() if v))
        for d, r, h in samples:
            print(f"        {d.split('.')[-1]}: EN={r[:52]!r} -> {h[:52]!r}")

    out = ROOT / "scripts" / "_head_keep.json"
    out.write_text(json.dumps(keep_map, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(len(v) for v in keep_map.values())
    print(f"\nTOTAL keep entries: {total} -> {out.name}")


if __name__ == "__main__":
    main()
