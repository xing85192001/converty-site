"""B 层内容生成引擎：翻译 + 安全合并到 6 语言 messages + posts.ts。

用法：
  python b_gen_engine.py            # 处理所有 b_data_*.py
  python b_gen_engine.py --dry      # 只统计，不写文件

数据模块约定：
  b_data_categories.py -> CATEGORY_INTROS = { "<catId>": {"description":..., "intro":...}, ... }
  b_data_finance.py    -> ARTICLES = [ {slug,date,category,readingMinutes, zh:{title,excerpt,blocks}}, ... ]
  blocks: [{type:"p"|"h2"|"callout", text}, {type:"ul", items:[...]}]
"""
import sys
import os
import re
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import b_translate as T  # noqa: E402

LOCALES = ["zh", "zh-TW", "en", "de", "ja", "es"]
MSG_DIR = "src/messages"
POSTS_TS = "src/lib/blog/posts.ts"

RELATED_ARTICLES = {
    "zh": "相关文章",
    "zh-TW": "相關文章",
    "en": "Related articles",
    "de": "Verwandte Artikel",
    "ja": "関連記事",
    "es": "Artículos relacionados",
}

# 仅校正英文中转术语（会惠及德日西，因为它们从英文派生）
GLOSSARY_EN = {
    "Body Quality Index": "Body Mass Index",
    "body quality index": "body mass index",
}


def fix_gloss_en(text):
    for k, v in GLOSSARY_EN.items():
        text = text.replace(k, v)
    return text


def trans_list(texts):
    """zh 文本列表 -> {lang: 同序列表}。空行/对齐失败自动回退逐条。"""
    joined = "\n".join(texts)
    en = fix_gloss_en(T.to_en(joined))
    parts_en = en.split("\n")
    if len(parts_en) != len(texts):
        parts_en = [fix_gloss_en(T.to_en(t)) for t in texts]

    de = T.to_de(en).split("\n")
    if len(de) != len(texts):
        de = [T.to_de(x) for x in parts_en]

    ja = T.to_ja(en).split("\n")
    if len(ja) != len(texts):
        ja = [T.to_ja(x) for x in parts_en]

    es = T.to_es(en).split("\n")
    if len(es) != len(texts):
        es = [T.to_es(x) for x in parts_en]

    zhtw = T.to_zhtw(joined).split("\n")
    if len(zhtw) != len(texts):
        zhtw = [T.to_zhtw(t) for t in texts]

    return {"zh": texts, "zh-TW": zhtw, "en": parts_en, "de": de, "ja": ja, "es": es}


def process_category(data):
    texts = [data["description"], data["intro"]]
    tr = trans_list(texts)
    return {lang: {"description": tr[lang][0], "intro": tr[lang][1]} for lang in LOCALES}


def process_article(art):
    zh = art["zh"]
    texts = [zh["title"], zh["excerpt"]]
    for b in zh["blocks"]:
        if b["type"] in ("p", "h2", "callout"):
            texts.append(b["text"])
        elif b["type"] == "ul":
            for it in b["items"]:
                texts.append(it)
    tr = trans_list(texts)
    out = {}
    for lang in LOCALES:
        lst = tr[lang]
        title = lst[0]
        excerpt = lst[1]
        ptr = 2
        blocks = []
        for b in zh["blocks"]:
            if b["type"] in ("p", "h2", "callout"):
                blocks.append({"type": b["type"], "text": lst[ptr]})
                ptr += 1
            elif b["type"] == "ul":
                items = []
                for _ in b["items"]:
                    items.append(lst[ptr])
                    ptr += 1
                blocks.append({"type": "ul", "items": items})
        out[lang] = {"title": title, "excerpt": excerpt, "blocks": blocks}
    return out


def load_data():
    all_cat = {}
    all_art = {}
    meta = []
    if os.path.exists("b_data_categories.py"):
        import b_data_categories as M  # noqa

        for cid, data in M.CATEGORY_INTROS.items():
            all_cat[cid] = process_category(data)
    import glob

    written = set()
    for mf in sorted(glob.glob("b_data_*.py")):
        name = os.path.splitext(os.path.basename(mf))[0]
        if name == "b_data_categories":
            continue
        try:
            m = __import__(name)
        except ImportError:
            continue
        for art in m.ARTICLES:
            if art["slug"] in written:
                continue
            all_art[art["slug"]] = process_article(art)
            meta.append(art)
            written.add(art["slug"])
    return all_cat, all_art, meta


def merge_messages(all_cat, all_art, dry=False):
    for loc in LOCALES:
        path = os.path.join(MSG_DIR, f"{loc}.json")
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        d.setdefault("category", {})
        for cid, res in all_cat.items():
            d["category"][cid] = res[loc]
        d.setdefault("blog", {}).setdefault("posts", {})
        for slug, res in all_art.items():
            d["blog"]["posts"][slug] = res[loc]
        d.setdefault("common", {})["relatedArticles"] = RELATED_ARTICLES[loc]
        if dry:
            print(f"[dry] {loc}.json: categories={len(all_cat)} articles={len(all_art)}")
            continue
        s = json.dumps(d, ensure_ascii=False, indent=2)
        s = s.replace("\n", "\r\n")  # 保留 CRLF
        with open(path, "w", encoding="utf-8") as f:
            f.write(s + "\r\n")
    if dry:
        return
    print(f"merged messages for {len(LOCALES)} locales: "
          f"{len(all_cat)} categories, {len(all_art)} articles")


def update_posts_ts(meta, dry=False):
    with open(POSTS_TS, encoding="utf-8") as f:
        content = f.read()
    existing = set(re.findall(r'slug:\s*"([^"]+)"', content))
    new_entries = []
    for art in meta:
        if art["slug"] in existing:
            continue
        new_entries.append(
            '\t{{\n\t\tslug: "{slug}",\n\t\tdate: "{date}",\n\t\t'
            'category: "{category}",\n\t\treadingMinutes: {rm},\n\t}}},'.format(
                slug=art["slug"], date=art["date"],
                category=art["category"], rm=art["readingMinutes"]))
    if not new_entries:
        print("posts.ts: no new entries")
        return
    if dry:
        print(f"[dry] posts.ts: would add {len(new_entries)} entries")
        return
    m = re.search(r"(export const blogPosts: BlogPostBase\[\] = \[)(.*?)(\n\];)",
                  content, re.DOTALL)
    if not m:
        print("posts.ts: marker not found, abort")
        return
    insert = "\n".join(new_entries)
    content = content[:m.start(2)] + insert + "\n" + content[m.start(2):]
    with open(POSTS_TS, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"posts.ts: added {len(new_entries)} entries")


if __name__ == "__main__":
    dry = "--dry" in sys.argv
    all_cat, all_art, meta = load_data()
    print(f"loaded: {len(all_cat)} categories, {len(all_art)} articles")
    merge_messages(all_cat, all_art, dry=dry)
    update_posts_ts(meta, dry=dry)
    print("done.")
