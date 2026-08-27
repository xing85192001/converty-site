#!/usr/bin/env python3
"""Extract tool feature strings from src/lib/registry/tool-features.ts for all locales
that have hardcoded translations (en, zh, zh-TW, vi, id), keyed for next-intl.
Outputs scripts/_tool_features_{locale}.json.
"""
import json
import re
from pathlib import Path

SRC = Path("src/lib/registry/tool-features.ts")
OUT_DIR = Path("scripts")


def balance(text: str, start: int) -> str:
    open_char = text[start]
    close_map = {"(": ")", "[": "]", "{": "}"}
    close_char = close_map[open_char]
    depth = 1
    i = start + 1
    while i < len(text) and depth > 0:
        c = text[i]
        if c == open_char:
            depth += 1
        elif c == close_char:
            depth -= 1
        i += 1
    return text[start:i]


def parse_feature_obj(body: str) -> dict:
    title = re.search(r'title:\s*"([^"]+)"', body)
    desc = re.search(r'description:\s*"([^"]+)"', body)
    color = re.search(r'color:\s*"([^"]+)"', body)
    return {
        "title": title.group(1) if title else "",
        "description": desc.group(1) if desc else "",
        "color": color.group(1) if color else "blue",
    }


def split_array_items(array_body: str) -> list[str]:
    items = []
    i = 0
    while i < len(array_body):
        idx = array_body.find("{", i)
        if idx == -1:
            break
        obj = balance(array_body, idx)
        items.append(obj)
        i = idx + len(obj)
    return items


def parse_highlights(block: str) -> dict:
    items = split_array_items(block)
    result = {}
    keys = ["realTimeCalculation", "multiPlatformReady", "historyReady"]
    for i, item in enumerate(items):
        obj = parse_feature_obj(item)
        key = keys[i] if i < len(keys) else f"highlight{i}"
        result[key] = {"title": obj["title"], "description": obj["description"]}
    return result


def parse_record_block(block: str) -> dict:
    records = {}
    pattern = re.compile(r'^\s+([a-zA-Z0-9_-]+|"[a-zA-Z0-9_-]+"):\s*\{', re.MULTILINE)
    matches = list(pattern.finditer(block))
    for idx, m in enumerate(matches):
        rec_id = m.group(1).strip('"')
        start = m.end() - 1
        next_start = matches[idx + 1].start() if idx + 1 < len(matches) else len(block)
        rec_body = block[start:next_start]

        cf_match = re.search(r"coreFeatures:\s*(\[)", rec_body)
        core_features = []
        if cf_match:
            cf_array = balance(rec_body, cf_match.start(1))
            for item in split_array_items(cf_array[1:-1]):
                core_features.append(parse_feature_obj(item))

        highlights = ["realTimeCalculation", "multiPlatformReady", "historyReady"]
        records[rec_id] = {"coreFeatures": core_features, "highlights": highlights}
    return records


def parse_translations(text: str, locale: str) -> dict[str, str]:
    """Parse TRANSLATIONS[locale] dict mapping English text -> translated text."""
    marker = f'{locale}: {{'
    start = text.find(marker)
    if start == -1:
        return {}
    open_brace = start + len(locale) + 2  # after "vi: "
    block = balance(text, open_brace)
    # Extract key: "value" pairs. Keys may be unquoted identifiers or quoted strings.
    result = {}
    # Pattern: "English text": "translation", or Identifier: "translation",
    # We want both. Simpler: find all "...": "..." pairs.
    pattern = re.compile(r'"([^"]+)"\s*:\s*"([^"]*)"')
    for m in pattern.finditer(block):
        result[m.group(1)] = m.group(2)
    # Also handle unquoted keys like Concentration: "Nồng độ",
    pattern2 = re.compile(r'\b([a-zA-Z][a-zA-Z0-9_/]*)\s*:\s*"([^"]*)"')
    for m in pattern2.finditer(block):
        if m.group(1) not in {"color", "description"}:  # avoid false positives
            result[m.group(1)] = m.group(2)
    return result


def slugify_title(title: str) -> str:
    parts = re.split(r"[^a-zA-Z0-9]+", title.strip())
    parts = [p for p in parts if p]
    if not parts:
        return "feature"
    key = parts[0].lower() + "".join(p.capitalize() for p in parts[1:])
    key = re.sub(r"[^a-zA-Z0-9]", "", key)
    return key


def build_locale(en_highlights: dict, en_categories: dict, en_slugs: dict,
                 hl_localized: dict | None, cat_localized: dict | None, slug_localized: dict | None,
                 trans_dict: dict[str, str] | None) -> dict:
    """Build keyed messages for one locale from English base + optional localized data."""
    core = {}
    highlights = {}

    def get_text(en_title: str, en_desc: str) -> tuple[str, str]:
        if trans_dict is not None:
            return trans_dict.get(en_title, en_title), trans_dict.get(en_desc, en_desc)
        return en_title, en_desc

    # Highlights
    for key, val in en_highlights.items():
        title, desc = get_text(val["title"], val["description"])
        if hl_localized and key in hl_localized:
            title = hl_localized[key]["title"]
            desc = hl_localized[key]["description"]
        highlights[key] = {"title": title, "description": desc}

    # Build core strings and category/slug references
    categories = {}
    for cat_id, cat in en_categories.items():
        cat_out = {"coreFeatures": [], "highlights": cat["highlights"].copy()}
        loc_cat = cat_localized.get(cat_id) if cat_localized else None
        for i, feat in enumerate(cat["coreFeatures"]):
            if loc_cat and i < len(loc_cat["coreFeatures"]):
                title = loc_cat["coreFeatures"][i]["title"]
                desc = loc_cat["coreFeatures"][i]["description"]
            else:
                title, desc = get_text(feat["title"], feat["description"])
            key = slugify_title(feat["title"])
            # de-duplicate by appending number if same base key maps to different text
            base = key
            n = 1
            while key in core and core[key] != {"title": title, "description": desc}:
                key = f"{base}{n}"
                n += 1
            core[key] = {"title": title, "description": desc}
            cat_out["coreFeatures"].append(key)
        categories[cat_id] = cat_out

    slugs = {}
    for slug_id, slug in en_slugs.items():
        slug_out = {"coreFeatures": [], "highlights": slug["highlights"].copy()}
        loc_slug = slug_localized.get(slug_id) if slug_localized else None
        for i, feat in enumerate(slug["coreFeatures"]):
            if loc_slug and i < len(loc_slug["coreFeatures"]):
                title = loc_slug["coreFeatures"][i]["title"]
                desc = loc_slug["coreFeatures"][i]["description"]
            else:
                title, desc = get_text(feat["title"], feat["description"])
            key = slugify_title(feat["title"])
            base = key
            n = 1
            while key in core and core[key] != {"title": title, "description": desc}:
                key = f"{base}{n}"
                n += 1
            core[key] = {"title": title, "description": desc}
            slug_out["coreFeatures"].append(key)
        slugs[slug_id] = slug_out

    return {"toolFeatures": {"highlights": highlights, "core": core, "categories": categories, "slugs": slugs}}


def main():
    text = SRC.read_text(encoding="utf-8")

    # English base
    hl_start = text.find("const highlightsEn: ToolHighlights[] = [")
    hl_array_start = text.find("[", hl_start + len("const highlightsEn: ToolHighlights[] = "))
    hl_array = balance(text, hl_array_start)
    en_highlights = parse_highlights(hl_array[1:-1])

    cat_marker = "const byCategoryEn: Record<string, ToolFeatures> = {"
    cat_start = text.find(cat_marker)
    cat_open = cat_start + len(cat_marker) - 1
    cat_block = balance(text, cat_open)
    en_categories = parse_record_block(cat_block[1:-1])

    slug_marker = "const bySlugEn: Record<string, ToolFeatures> = {"
    slug_start = text.find(slug_marker)
    slug_open = slug_start + len(slug_marker) - 1
    slug_block = balance(text, slug_open)
    en_slugs = parse_record_block(slug_block[1:-1])

    # Chinese
    hl_zh_start = text.find("const highlightsZh: ToolHighlights[] = [")
    hl_zh_array_start = text.find("[", hl_zh_start + len("const highlightsZh: ToolHighlights[] = "))
    hl_zh_array = balance(text, hl_zh_array_start)
    zh_highlights = parse_highlights(hl_zh_array[1:-1])

    cat_zh_marker = "const byCategoryZh: Record<string, ToolFeatures> = {"
    cat_zh_start = text.find(cat_zh_marker)
    cat_zh_open = cat_zh_start + len(cat_zh_marker) - 1
    cat_zh_block = balance(text, cat_zh_open)
    zh_categories = parse_record_block(cat_zh_block[1:-1])

    slug_zh_marker = "const bySlugZh: Record<string, ToolFeatures> = {"
    slug_zh_start = text.find(slug_zh_marker)
    slug_zh_open = slug_zh_start + len(slug_zh_marker) - 1
    slug_zh_block = balance(text, slug_zh_open)
    zh_slugs = parse_record_block(slug_zh_block[1:-1])

    # vi/id translations
    vi_trans = parse_translations(text, "vi")
    id_trans = parse_translations(text, "id")

    en_messages = build_locale(en_highlights, en_categories, en_slugs, None, None, None, None)
    zh_messages = build_locale(en_highlights, en_categories, en_slugs, zh_highlights, zh_categories, zh_slugs, None)
    vi_messages = build_locale(en_highlights, en_categories, en_slugs, None, None, None, vi_trans)
    id_messages = build_locale(en_highlights, en_categories, en_slugs, None, None, None, id_trans)

    for loc, messages in [("en", en_messages), ("zh", zh_messages), ("zh-TW", zh_messages), ("vi", vi_messages), ("id", id_messages)]:
        out = OUT_DIR / f"_tool_features_{loc}.json"
        out.write_text(json.dumps(messages, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {out}")

    print(
        f"Highlights: {len(en_highlights)}, categories: {len(en_categories)}, slugs: {len(en_slugs)}, core strings: {len(en_messages['toolFeatures']['core'])}"
    )


if __name__ == "__main__":
    main()
