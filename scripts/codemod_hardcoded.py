"""Codemod: replace hardcoded English UI strings with i18n calls.

For each occurrence recorded in scripts/_hardcoded.json:
  - jsx   text nodes  ->  <T k="ui.<slug>" />   (universal client component)
  - attr  values      ->  {tUi('<slug>')}         (scoped hook, ui namespace)

Imports / hooks are injected per file:
  - <T> import added (after "use client", else at top) when any jsx replaced.
  - For attr replacements, a scoped accessor is injected at the top of the
    component body:
        * client component:  const tUi = useTranslations("ui");
        * server component:  const tUi = await getTranslations("ui");
    (imported from "next-intl/server")

The two IP-example phrases are skipped (kept literal).
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HARD = os.path.join(ROOT, "scripts", "_hardcoded.json")

SKIP_SLUGS = {
    "192-168-1-50-or-2001-db8-1",
    "192-168-1-1-or-2001-db8-1",
}


def load_occurrences():
    with open(HARD, encoding="utf-8") as f:
        data = json.load(f)
    phrase_to_slug = {p["phrase"]: p["slug"] for p in data["phrases"]}
    by_file = {}
    for o in data["occurrences"]:
        slug = phrase_to_slug.get(o["phrase"])
        if not slug or slug in SKIP_SLUGS:
            continue
        o = dict(o)
        o["slug"] = slug
        by_file.setdefault(o["file"], []).append(o)
    return by_file


def add_import(lines, import_line, marker):
    if any(marker in ln for ln in lines):
        return lines
    for i, ln in enumerate(lines):
        if '"use client"' in ln:
            return lines[: i + 1] + [import_line] + lines[i + 1 :]
    return [import_line] + lines


def find_component_start(lines):
    """Return index of the line that opens the first component function body."""
    fn_pat = re.compile(
        r"(export\s+default\s+function|export\s+function|export\s+const\s+\w+\s*=|^\s*function\s+\w+\s*\(|^\s*const\s+\w+\s*=\s*\()"
    )
    for i, ln in enumerate(lines):
        if fn_pat.search(ln):
            return i
    return 0


def inject_decl(lines, decl):
    """Insert `decl` as the first statement of the component body."""
    start = find_component_start(lines)
    # find the function body opening: first '{' after the signature,
    # or for arrow `=> (` the '(' is the body; we instead insert before `return (`.
    # Strategy: insert right before the first `return (` or `=> (` if present,
    # else after the opening '{' of the function.
    for i in range(start, len(lines)):
        if re.match(r"\s*return\s*\(", lines[i]):
            out = list(lines)
            out.insert(i, "  " + decl)
            return out
    for i in range(start, min(start + 6, len(lines))):
        if "=>" in lines[i] and "(" in lines[i]:
            # arrow component: insert a hook line after the opening of the body
            # find the matching '(' and insert after the enclosing paren line
            out = list(lines)
            out.insert(i + 1, "  " + decl)
            return out
    # fallback: after the opening brace of the function
    for i in range(start, min(start + 6, len(lines))):
        if "{" in lines[i]:
            out = list(lines)
            out.insert(i + 1, "  " + decl)
            return out
    return lines


def main():
    by_file = load_occurrences()
    only = os.environ.get("ONLY")
    total_changed = 0
    total_errors = 0

    for rel, occs in by_file.items():
        if only and only not in rel:
            continue
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print(f"[missing] {rel}")
            total_errors += 1
            continue

        with open(path, encoding="utf-8") as f:
            lines = f.read().split("\n")

        is_client = ('"use client"' in "\n".join(lines)) or ("useTranslations(" in "\n".join(lines))
        has_jsx = any(o["kind"] == "jsx" for o in occs)
        has_attr = any(o["kind"] == "attr" for o in occs)
        changed = False

        # Deduplicate by (slug, kind); replace every occurrence of the phrase
        # found anywhere in the file (line numbers from the scan are stale).
        seen = set()
        jsx_done = False
        attr_done = False
        for o in occs:
            key = (o["slug"], o["kind"])
            if key in seen:
                continue
            seen.add(key)
            slug = o["slug"]
            phrase = o["phrase"]
            kind = o["kind"]
            esc = re.escape(phrase)

            if kind == "jsx":
                pat = re.compile(r"(>|\s)(" + esc + r")(\s|<)")
                repl = lambda m, s=slug: m.group(1) + '<T k="ui.' + s + '" />' + m.group(3)
            else:
                # Strict JSX attribute: `attr="..."` with NO space around `=`.
                # This avoids corrupting destructuring parameter defaults such as
                # `placeholder = "..."` (which would become invalid `= {tUi(...)}`).
                pat = re.compile(r'=["\']' + esc + r'["\']')
                repl = lambda m, s=slug: "={tUi('" + s + "')}"

            new_lines = []
            file_matched = False
            for ln in lines:
                if pat.search(ln):
                    new_ln = pat.sub(repl, ln)
                    if new_ln != ln:
                        file_matched = True
                    new_lines.append(new_ln)
                else:
                    new_lines.append(ln)
            if file_matched:
                lines = new_lines
                changed = True
                if kind == "jsx":
                    jsx_done = True
                else:
                    attr_done = True
            else:
                print(f"[nomatch] {rel} :: {phrase!r} ({kind})")
                total_errors += 1

        if not changed:
            continue

        if jsx_done:
            lines = add_import(lines, 'import { T } from "@/components/ui/t";', '@/components/ui/t"')

        if attr_done:
            if is_client:
                lines = add_import(lines, 'import { useTranslations } from "next-intl";', "useTranslations")
                if not any('const tUi' in ln or 'useTranslations("ui")' in ln for ln in lines):
                    lines = inject_decl(lines, 'const tUi = useTranslations("ui");')
            else:
                lines = add_import(lines, 'import { getTranslations } from "next-intl/server";', "getTranslations")
                if not any('const tUi' in ln or 'getTranslations("ui")' in ln for ln in lines):
                    lines = inject_decl(lines, 'const tUi = await getTranslations("ui");')

        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        total_changed += 1

    print(f"\nFiles changed: {total_changed}, errors: {total_errors}")


if __name__ == "__main__":
    main()
