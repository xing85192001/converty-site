#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Scan src/ for user-facing hardcoded English strings NOT routed through next-intl.

Heuristic (not perfect) for audit purposes:
  - JSX text nodes: text between `>` and `</` that has letters and no `{`/`}`.
  - Attribute literals on user-facing props: title, placeholder, aria-label, alt, label.
Filters out obvious code (camelCase identifiers, className/style, urls, px, #{}, etc).
Outputs a deduped list of unique phrases with occurrence count + sample locations,
and whether an equivalent key likely exists in en.json.
"""
import json, os, re, glob
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
MSG = os.path.join(SRC, "messages", "en.json")

en = json.load(open(MSG, encoding="utf-8"))

# Build a flat set of all english values (lowercased) to detect existing equivalents
def flatten(o, p=""):
    out = set()
    if isinstance(o, dict):
        for k, v in o.items():
            out |= flatten(v, f"{p}.{k}" if p else k)
    elif isinstance(o, list):
        out.add(p)
    else:
        out.add(p)
    return out

en_values_lower = set()
en_key_by_value = {}
def collect_values(o):
    if isinstance(o, dict):
        for v in o.values():
            collect_values(v)
    elif isinstance(o, list):
        for v in o:
            collect_values(v)
    elif isinstance(o, str):
        en_values_lower.add(o.lower())
collect_values(en)

UI_ATTRS = ["title", "placeholder", "aria-label", "alt", "label", "aria-placeholder", "aria-placeholder", "tooltip", "data-tooltip"]

# regexes
re_jsx_text = re.compile(r">([^<>{}]*?[A-Za-z][^<>{}]*?)</")
re_attr = re.compile(r"(?:title|placeholder|aria-label|alt|label|tooltip)\s*=\s*[\"']([^\"']+)[\"']")

# code-ish exclusion
CODE_TOKENS = re.compile(r"(=>|function|import|export|const|let|var|return|className|style|useState|useEffect|\.map\(|\.filter\(|http|px|#[0-9a-fA-F]{3,6}|on[A-Z]|console\.|TODO|FIXME)")
def looks_code(s):
    if CODE_TOKENS.search(s):
        return True
    # pure camelCase / snake_case single token with no space and length>0
    if " " not in s and not any(c in s for c in ".,!?;:'-/") and re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", s):
        return True
    # contains parenthesis or template/code symbols
    if any(c in s for c in "(){};=+*/<>|&"):
        return True
    return False

def is_user_text(s):
    s = s.strip()
    if len(s) < 2:
        return False
    if not re.search(r"[A-Za-z]{2,}", s):
        return False
    # must contain at least one space OR a capitalized word OR a common word, to avoid code
    has_space = " " in s
    has_cap = re.search(r"[A-Z][a-z]", s) is not None
    has_vowel_word = re.search(r"\b(the|the|and|or|for|with|your|please|loading|search|close|error|free|online|tool|convert|calculate|result|submit|cancel|save|edit|delete|add|remove|select|options?|settings|menu|home|about|contact|page|total|value|from|to|category|unit|view|more|all|new|old)\b", s, re.I) is not None
    if not (has_space or has_cap or has_vowel_word):
        return False
    if looks_code(s):
        return False
    return True

occurrences = []  # (file, line, phrase)
files = glob.glob(os.path.join(SRC, "**", "*.tsx"), recursive=True) + glob.glob(os.path.join(SRC, "**", "*.ts"), recursive=True)
for f in files:
    try:
        lines = open(f, encoding="utf-8", errors="ignore").readlines()
    except Exception:
        continue
    rel = os.path.relpath(f, ROOT)
    for i, line in enumerate(lines, 1):
        # skip lines that already use t(...) for the string (the string is the i18n key, not visible text)
        for m in re_jsx_text.finditer(line):
            txt = m.group(1).strip()
            if is_user_text(txt):
                occurrences.append((rel, i, txt))
        for m in re_attr.finditer(line):
            txt = m.group(1).strip()
            if is_user_text(txt):
                occurrences.append((rel, i, txt))

# dedup phrases
count = defaultdict(int)
samples = defaultdict(list)
for rel, i, txt in occurrences:
    count[txt] += 1
    if len(samples[txt]) < 3:
        samples[txt].append(f"{rel}:{i}")

print(f"TOTAL candidate occurrences: {len(occurrences)}")
print(f"UNIQUE phrases: {len(count)}")
print()
# check existing equivalent in en.json
def existing_equiv(phrase):
    p = phrase.lower()
    # exact value match
    if p in en_values_lower:
        return "exact"
    # all words of len>=4 present in some en value
    words = [w for w in re.findall(r"[A-Za-z]{4,}", p)]
    if words:
        for v in en_values_lower:
            if all(w in v for w in words):
                return "partial:" + v[:60]
    return ""

print("=== UNIQUE PHRASES (sorted by occurrence count desc) ===")
for phrase, c in sorted(count.items(), key=lambda x: -x[1]):
    eq = existing_equiv(phrase)
    print(f"[{c:>3}x] {phrase!r}  {('| en-equiv: '+eq) if eq else ''}")
    for s in samples[phrase]:
        print(f"        e.g. {s}")
