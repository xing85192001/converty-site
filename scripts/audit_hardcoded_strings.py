#!/usr/bin/env python3
"""Audit hardcoded user-facing English strings across src (ts/tsx).

Captures:
  1. Quoted string/backtick literals that look like prose (not keys/urls/imports)
  2. JSX/TSX text nodes (text between > and < that contains letters)

Outputs scripts/_hardcoded_audit.json with a categorized report and a flat list.
"""
import json
import re
from pathlib import Path

ROOT = Path("src")
EXCLUDE_DIRS = {"__tests__", "node_modules", ".next", "fixtures"}

# Quoted string / backtick literal of length 2..160 (exclude newlines)
STRING_PAT = re.compile(r'"([^"\n]{2,160})"|\'([^\'\n]{2,160})\'|`([^`\n]{2,160})`')

# JSX/TSX text node: text between a > and a < with at least one letter,
# not containing braces/angle brackets. Newlines allowed (multi-line JSX text).
JSX_TEXT_PAT = re.compile(r'>([^<>{}]+)<')

# Things that are clearly not UI prose
SKIP = [
    re.compile(r'^(https?|mailto|tel):', re.I),
    re.compile(r'^@'),
    re.compile(r'^[./]'),                       # relative imports / paths
    re.compile(r'^[A-Za-z]:\\\\'),               # windows paths
    re.compile(r'^#'),                           # hex colors / md headings
    re.compile(r'^/\*'),                         # comments
    re.compile(r'^[0-9#%.\s\-+(),:]+$'),        # numbers / units / punctuation
    re.compile(r'^[A-Za-z][A-Za-z0-9]*$'),      # pure identifier (key/var)
    re.compile(r'^[a-z][a-z0-9]*(\.[a-z0-9]+)+$', re.I),  # dotted paths
    re.compile(r'^(import|export|const|let|var|function|return|from|type|interface)\b'),
]

# Very short allowlist of common single-word UI labels we still want to flag
SINGLE_WORD_OK = {
    "cancel", "reset", "search", "clear", "copy", "paste", "delete", "edit",
    "save", "loading", "loading...", "submit", "close", "open", "settings",
    "back", "next", "previous", "home", "help", "menu", "share", "download",
    "upload", "print", "send", "add", "remove", "yes", "no", "ok", "apply",
    "confirm", "retry", "refresh", "filter", "sort", "more", "less", "done",
    "error", "warning", "success", "info", "calculating", "converting",
    "result", "results", "value", "amount", "from", "to", "category", "tool",
    "tools", "about", "contact", "privacy", "terms", "language", "theme",
}

HEX = re.compile(r'#[0-9a-fA-F]{3,8}\b')

# Tailwind / CSS class token signatures
CSS_TOKEN = re.compile(
    r'\b(flex|grid|block|inline|hidden|p-[0-9]|px-|py-|m-[0-9]|mx-|my-|mt-|mb-|ml-|mr-'
    r'|text-|bg-|border|rounded|font-|w-[0-9]|h-[0-9]|space-|gap-|items-|justify-'
    r'|self-|overflow-|relative|absolute|fixed|inset-|col-|row-|object-|opacity-'
    r'|shadow|transition|hover:|focus:|dark:|sm:|md:|lg:|xl:|min-|max-)\b'
)
KEY_TOKEN = re.compile(r'-\$\{|\$\{|\}|-step-|step-\d|comparison')


def is_css_or_key(s: str) -> bool:
    # If it reads like a list of CSS utility classes, skip.
    if CSS_TOKEN.search(s):
        # Heuristic: mostly hyphenated lowercase tokens separated by spaces
        tokens = s.split()
        if len(tokens) >= 2 and sum(1 for t in tokens if CSS_TOKEN.search(t) or re.fullmatch(r'[a-z][a-z0-9-]*', t)) >= max(2, len(tokens) * 0.6):
            return True
    if KEY_TOKEN.search(s):
        return True
    return False


def is_prose(s: str) -> bool:
    s = s.strip()
    if not s or len(s) > 160:
        return False
    if is_css_or_key(s):
        return False
    if HEX.search(s):
        return False
    if any(p.match(s) for p in SKIP):
        return False
    # Must contain at least one letter
    if not re.search(r'[A-Za-z]', s):
        return False
    # Require either a space (phrase) or a short common UI word
    if ' ' in s or '/' in s or any(c.isupper() for c in s[1:]):
        # Phrase or mixed-case label -> likely UI text
        return True
    low = s.lower().strip()
    if low in SINGLE_WORD_OK:
        return True
    # Single word with a vowel-ish English shape and length >=5, but avoid keys
    if 5 <= len(s) <= 20 and re.search(r'[aeiou]', low):
        return True
    return False


def main():
    findings = {}
    seen = set()
    for ext in ("ts", "tsx"):
        for path in ROOT.rglob(f"*.{ext}"):
            if any(part in EXCLUDE_DIRS for part in path.parts):
                continue
            if path in seen:
                continue
            seen.add(path)
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue
        matches = set()
        # Quoted literals
        for m in STRING_PAT.finditer(text):
            s = m.group(1) or m.group(2) or m.group(3)
            if is_prose(s):
                matches.add(s.strip())
        # JSX text nodes
        for m in JSX_TEXT_PAT.finditer(text):
            s = m.group(1).strip()
            if s and is_prose(s):
                matches.add(s)
        if matches:
            rel = str(path.relative_to(ROOT))
            findings[rel] = sorted(matches)

    # Categorize by top-level dir
    cat_map = {
        "lib": "lib (data/logic)",
        "components": "components (UI)",
        "app": "app (pages/routes)",
        "hooks": "hooks",
        "stores": "stores",
        "context": "context",
    }
    categories = {}
    for file, strings in findings.items():
        prefix = file.split("/")[0]
        cat = cat_map.get(prefix, prefix)
        categories.setdefault(cat, {})[file] = strings

    report = {
        "summary_by_category": {c: sum(len(v) for v in f.values()) for c, f in categories.items()},
        "total_files": len(findings),
        "total_strings": sum(len(v) for v in findings.values()),
        "categories": categories,
    }
    out = Path("scripts/_hardcoded_audit.json")
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    # Also write a flat review list
    flat = []
    for file, strings in findings.items():
        for s in strings:
            flat.append({"file": file, "text": s})
    Path("scripts/_hardcoded_flat.json").write_text(
        json.dumps(flat, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Wrote {out} and scripts/_hardcoded_flat.json")
    print(f"Files with hardcoded strings: {len(findings)}")
    print(f"Total candidate strings: {report['total_strings']}")
    print("By category:")
    for c, n in sorted(report["summary_by_category"].items(), key=lambda x: -x[1]):
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main()
