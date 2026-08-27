#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract candidate hardcoded user-facing English strings into structured JSON
for the i18n fix. Produces scripts/_hardcoded.json with:
  phrases: [{slug, phrase, count}]
  occurrences: [{file, line, phrase, kind}]  kind in {jsx, attr}
Slugs are deterministic kebab-case of the phrase (ASCII-folded), deduped.
"""
import json, os, re, glob
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")

re_jsx_text = re.compile(r">([^<>{}]*?[A-Za-z][^<>{}]*?)</")
re_attr = re.compile(r"(?:title|placeholder|aria-label|alt|label|tooltip)\s*=\s*[\"']([^\"']+)[\"']")

CODE_TOKENS = re.compile(r"(=>|function|import|export|const|let|var|return|className|style|useState|useEffect|\.map\(|\.filter\(|http|px|#[0-9a-fA-F]{3,6}|on[A-Z]|console\.|TODO|FIXME)")
def looks_code(s):
    if CODE_TOKENS.search(s):
        return True
    if " " not in s and not any(c in s for c in ".,!?;:'-/"):
        if re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", s):
            return True
    if any(c in s for c in "(){};=+*/<>|&"):
        return True
    return False

def is_user_text(s):
    s = s.strip()
    if len(s) < 2:
        return False
    if not re.search(r"[A-Za-z]{2,}", s):
        return False
    has_space = " " in s
    has_cap = re.search(r"[A-Z][a-z]", s) is not None
    has_vowel_word = re.search(r"\b(the|and|or|for|with|your|please|loading|search|close|error|free|online|tool|convert|calculate|result|submit|cancel|save|edit|delete|add|remove|select|options?|settings|menu|home|about|contact|page|total|value|from|to|category|unit|view|more|all|new|old|enter|note|high|low|mid|typical|est|known|rules|verification|pros|cons|copied|redirecting|coming|soon|what|how|editorial|standards|offer|include|smallest|highest|network|difficulty|beam|deflection|diagram|diagram|file|size|connection|speed|latitude|calculation|details|significant|figures|input|method|matrix|result|arc|length|sector|area|symmetric|difference|related|roots|fixed|leave|empty|aspect|ratio|frame|rate|image|dimensions|screen|known|e.g)\b", s, re.I) is not None
    if not (has_space or has_cap or has_vowel_word):
        return False
    if looks_code(s):
        return False
    return True

occurrences = []
files = glob.glob(os.path.join(SRC, "**", "*.tsx"), recursive=True) + glob.glob(os.path.join(SRC, "**", "*.ts"), recursive=True)
for f in files:
    try:
        lines = open(f, encoding="utf-8", errors="ignore").readlines()
    except Exception:
        continue
    rel = os.path.relpath(f, ROOT).replace("\\", "/")
    for i, line in enumerate(lines, 1):
        for m in re_jsx_text.finditer(line):
            txt = m.group(1).strip()
            if is_user_text(txt):
                occurrences.append({"file": rel, "line": i, "phrase": txt, "kind": "jsx"})
        for m in re_attr.finditer(line):
            txt = m.group(1).strip()
            if is_user_text(txt):
                occurrences.append({"file": rel, "line": i, "phrase": txt, "kind": "attr"})

# dedup phrases -> slug
def slugify(phrase):
    s = phrase.lower().strip()
    # keep alphanumerics and spaces; drop punctuation
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\s+", "-", s).strip("-")
    return s

count = defaultdict(int)
for o in occurrences:
    count[o["phrase"]] += 1

slug_seen = {}
phrases = []
slug_to_phrase = {}
for phrase, c in sorted(count.items(), key=lambda x: -x[1]):
    base = slugify(phrase)
    slug = base
    n = 1
    while slug in slug_seen:
        n += 1
        slug = f"{base}-{n}"
    slug_seen[slug] = True
    slug_to_phrase[slug] = phrase
    phrases.append({"slug": slug, "phrase": phrase, "count": c})

out = {"phrases": phrases, "occurrences": occurrences}
with open(os.path.join(ROOT, "scripts", "_hardcoded.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f"occurrences: {len(occurrences)}")
print(f"unique phrases: {len(phrases)}")
print("\nAll unique phrases (slug :: phrase :: count):")
for p in phrases:
    print(f"  {p['slug']:42} :: {p['phrase']!r}  ({p['count']})")
