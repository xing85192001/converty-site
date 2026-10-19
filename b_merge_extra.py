"""针对性合并脚本：只处理 b_data_extra.py 的 12 个新 slug。

与全量 b_gen_engine.py 的区别（务必牢记，避免覆盖 B 层手修译文）：
  1. 只 import b_data_extra，绝不遍历其它 b_data_*.py，不重跑既有 slug 翻译。
  2. 离线翻译：直接调用 argostranslate 本地已装模型，跳过 update_package_index() 联网。
  3. zh 直用源；zh-TW 用 opencc s2twp；en/de/ja/es 走 zh->en->de/ja/es 链路（argos）。
  4. 内部链接保护：翻译前把 [文字](/slug) 抽成 ZL{i}Z 占位符，URL 不进译文，
     链接文字单独翻译，译后精确拼回 [译后文字](/slug)，杜绝 argos 把 URL 译坏。
  5. 只 append/覆盖这 12 个 slug 进 6 语言 messages json 与 posts.ts，不碰其它。

用法：
  python b_merge_extra.py            # 首次合并（slug 不存在则新增）
  python b_merge_extra.py --force    # 覆盖已存在的这 12 个 slug（修正译文用）
  python b_merge_extra.py --dry      # 只统计，不写文件
"""
import sys
import os
import re
import json

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)

LOCALES = ["zh", "zh-TW", "en", "de", "ja", "es"]
MSG_DIR = "src/messages"
POSTS_TS = "src/lib/blog/posts.ts"
SRC = "b_data_extra.py"

# 仅校正英文中转术语（惠及德日西，因它们从英文派生）
GLOSSARY_EN = {
    "Body Quality Index": "Body Mass Index",
    "body quality index": "body mass index",
}

# 内部链接：源格式 [文字](/slug)
LINK_RE = re.compile(r"\[([^\]]*)\]\((/[^)]+)\)")
# 占位符（纯 ASCII，argos 不会改；\s* 容忍可能的空格）
PLACE_RE = re.compile(r"ZL\s*(\d+)\s*Z")


def fix_gloss(text):
    for k, v in GLOSSARY_EN.items():
        text = text.replace(k, v)
    return text


def protect_links(text, link_db):
    """把 [文字](/slug) 替换为 ZL{i}Z，URL 存入 link_db，返回含占位符的文本。"""
    def repl(m):
        link_db.append((m.group(1), m.group(2)))
        return f"ZL{len(link_db) - 1}Z"
    return LINK_RE.sub(repl, text)


def restore_links(text, disp_trans, link_db):
    """把 ZL{i}Z 还原为 [译后文字](/slug)。"""

    def repl(m):
        i = int(m.group(1))
        if i >= len(link_db):
            return m.group(0)
        disp, url = link_db[i]
        dt = disp_trans[i] if i < len(disp_trans) else disp
        dt = re.sub(r"[\[\]()]", "", dt)  # 安全：去掉可能破坏 markdown 的括号
        return f"[{dt}]({url})"

    return PLACE_RE.sub(repl, text)


# ---------- 离线翻译（不联网） ----------
import argostranslate.package  # noqa: E402
import argostranslate.translate  # noqa: E402

# 离线补丁：模型包自带 stanza/ 子目录，argos 会选 StanzaSentencizer，
# 而 stanza 加载本地模型前要先联网拉 resources 索引 -> 离线必败。
# 这里把三种分句器的 split_sentences 换成按标点切句的纯离线实现，
# 既绕开 stanza/minisbd/spacy 的联网下载，又保留句子级切分以提升翻译质量。
import re as _re
import argostranslate.sbd as _sbd

_SENT_RE = _re.compile(r"(?<=[。！？；\n])|(?<=[.!?][ \t])")


def _trivial_split(self, text):
    parts = [p.strip() for p in _SENT_RE.split(text) if p.strip()]
    return parts if parts else [text]


for _cls in (_sbd.StanzaSentencizer, _sbd.MiniSBDSentencizer, _sbd.SpacySentencizerSmall):
    _cls.split_sentences = _trivial_split

_LANGS = {l.code: l for l in argostranslate.translate.get_installed_languages()}
_TR_CACHE = {}


def _translator(f, t):
    key = (f, t)
    if key not in _TR_CACHE:
        src = _LANGS.get(f)
        tgt = _LANGS.get(t)
        tr = None
        if src is not None and tgt is not None:
            try:
                tr = src.get_translation(tgt)
            except Exception:
                tr = None
        _TR_CACHE[key] = tr
    return _TR_CACHE[key]


def _batch(tr, text):
    if tr is None:
        return text
    parts = text.split("\n")
    out = tr.translate("\n".join(parts))
    out_parts = out.split("\n")
    if len(out_parts) == len(parts):
        return out
    return tr.translate(text)


def to_en(zh):
    return _batch(_translator("zh", "en"), zh)


def to_de(en):
    return _batch(_translator("en", "de"), en)


def to_ja(en):
    return _batch(_translator("en", "ja"), en)


def to_es(en):
    return _batch(_translator("en", "es"), en)


try:
    from opencc import OpenCC

    _CC = OpenCC("s2twp")
except Exception:
    _CC = None


def to_zhtw(zh):
    return _CC.convert(zh) if _CC else zh


def trans_list(texts):
    """zh 文本列表 -> {lang: 同序列表}。"""
    joined = "\n".join(texts)
    en = fix_gloss(to_en(joined))
    parts_en = en.split("\n")
    if len(parts_en) != len(texts):
        parts_en = [fix_gloss(to_en(t)) for t in texts]

    de = to_de(en).split("\n")
    if len(de) != len(texts):
        de = [to_de(x) for x in parts_en]

    ja = to_ja(en).split("\n")
    if len(ja) != len(texts):
        ja = [to_ja(x) for x in parts_en]

    es = to_es(en).split("\n")
    if len(es) != len(texts):
        es = [to_es(x) for x in parts_en]

    zhtw = to_zhtw(joined).split("\n")
    if len(zhtw) != len(texts):
        zhtw = [to_zhtw(t) for t in texts]

    return {"zh": texts, "zh-TW": zhtw, "en": parts_en, "de": de, "ja": ja, "es": es}


def process_article(art):
    zh = art["zh"]
    link_db = []
    raw_units = []
    raw_units.append(protect_links(zh["title"], link_db))
    raw_units.append(protect_links(zh["excerpt"], link_db))
    block_meta = []  # (type, unit_index) 或 (type, [unit_index,...])
    for b in zh["blocks"]:
        if b["type"] in ("p", "h2", "callout"):
            raw_units.append(protect_links(b["text"], link_db))
            block_meta.append((b["type"], len(raw_units) - 1))
        elif b["type"] == "ul":
            idxs = []
            for it in b["items"]:
                raw_units.append(protect_links(it, link_db))
                idxs.append(len(raw_units) - 1)
            block_meta.append((b["type"], idxs))

    displays = [d for d, _ in link_db]
    all_texts = raw_units + displays
    tr = trans_list(all_texts)
    unit_count = len(raw_units)

    out = {}
    for lang in LOCALES:
        lst = tr[lang]
        disp_trans = lst[unit_count:]

        def rebuild(text):
            return restore_links(text, disp_trans, link_db)

        title = rebuild(lst[0])
        excerpt = rebuild(lst[1])
        blocks = []
        for kind, info in block_meta:
            if kind == "ul":
                items = [rebuild(lst[i]) for i in info]
                blocks.append({"type": "ul", "items": items})
            else:
                blocks.append({"type": kind, "text": rebuild(lst[info])})
        out[lang] = {"title": title, "excerpt": excerpt, "blocks": blocks}
    return out


def load_extra():
    import importlib.util

    spec = importlib.util.spec_from_file_location("b_data_extra", os.path.join(HERE, SRC))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.ARTICLES


def merge_messages(per_locale_posts, force=False, dry=False):
    for loc in LOCALES:
        path = os.path.join(MSG_DIR, f"{loc}.json")
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        d.setdefault("blog", {}).setdefault("posts", {})
        existing = set(d["blog"]["posts"].keys())
        added = 0
        overwritten = 0
        for slug, post in per_locale_posts[loc].items():
            if slug in existing:
                if not force:
                    print(f"  [skip] {loc} {slug} already exists (use --force to overwrite)")
                    continue
                d["blog"]["posts"].pop(slug, None)
                overwritten += 1
            d["blog"]["posts"][slug] = post
            added += 1
        if dry:
            print(f"[dry] {loc}.json: would add/overwrite {added} posts (total {len(d['blog']['posts'])})")
            continue
        s = json.dumps(d, ensure_ascii=False, indent=2)
        s = s.replace("\n", "\r\n")  # 保留 CRLF
        with open(path, "w", encoding="utf-8") as f:
            f.write(s + "\r\n")
        print(f"  {loc}.json: +{added} posts (overwritten {overwritten}, total {len(d['blog']['posts'])})")


def update_posts_ts(articles, dry=False):
    with open(POSTS_TS, encoding="utf-8") as f:
        content = f.read()
    eol = "\r\n" if "\r\n" in content else "\n"
    existing = set(re.findall(r'slug:\s*"([^"]+)"', content))
    new_entries = []
    for art in articles:
        if art["slug"] in existing:
            print(f"  [skip] posts.ts {art['slug']} exists")
            continue
        new_entries.append(
            "\t{" + eol +
            f'\t\tslug: "{art["slug"]}",' + eol +
            f'\t\tdate: "{art["date"]}",' + eol +
            f'\t\tcategory: "{art["category"]}",' + eol +
            f'\t\treadingMinutes: {art["readingMinutes"]},' + eol +
            "\t},"
        )
    if not new_entries:
        print("posts.ts: no new entries")
        return
    if dry:
        print(f"[dry] posts.ts: would add {len(new_entries)} entries")
        return
    m = re.search(r"(export const blogPosts: BlogPostBase\[\] = \[)(.*?)(\n\];)", content, re.DOTALL)
    if not m:
        print("posts.ts: marker not found, abort")
        return
    insert = eol.join(new_entries) + eol
    content = content[:m.start(2)] + insert + content[m.start(2):]
    with open(POSTS_TS, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"posts.ts: +{len(new_entries)} entries")


def main():
    dry = "--dry" in sys.argv
    force = "--force" in sys.argv
    articles = load_extra()
    print(f"loaded {len(articles)} articles from {SRC} (force={force})")

    per_locale_posts = {loc: {} for loc in LOCALES}
    for art in articles:
        res = process_article(art)
        for loc in LOCALES:
            per_locale_posts[loc][art["slug"]] = res[loc]

    merge_messages(per_locale_posts, force=force, dry=dry)
    update_posts_ts(articles, dry=dry)
    print("done.")


if __name__ == "__main__":
    main()
