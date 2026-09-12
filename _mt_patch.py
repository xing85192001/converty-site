# -*- coding: utf-8 -*-
"""
把 zh.json 深度 guide 机器翻译补写到 en/de/ja/es 的薄工具页面。
引擎：argos-translate 离线模型（无联网 API）。
- en：直连 translate-zh_en
- de/ja/es：两阶段中转 zh -> en -> 目标语（argos 无直接 zh-目标 模型）

提速：argos 仅提供逐句接口，这里用「多句换行拼接 -> 一次推理 -> 按换行切回」做手动批量，
      对齐校验失败则回退逐句。整体约 15-20 分钟。

质量：对英文结果做少量高价值术语校正（如 Body Quality Index -> Body Mass Index），
      因 en 是中转源，该修正也惠及 de/ja/es。

策略细节：
- 只处理目标语言中 guide < 1000 字符（薄）的工具；已达标工具原样保留。
- 薄工具以 zh 的 guide 结构为准重建：逐字段翻译中文文本，数字/公式/单位/纯符号单元格原样保留。
- 工具级 name/description/metaDescription 若仍为中文也一并译出。
- 保持 JSON key 顺序，ensure_ascii=False、indent=2 写回。
- 可断点续跑：已写回的目标语言文件再次运行时薄工具数为 0，自动跳过。
"""
import io, json, re, collections, sys, time

BASE = "src/messages"
TARGETS = ["en", "de", "ja", "es"]
SRC = "zh"
BATCH = 30

# 仅当字符串含中日韩表意文字（含扩展 A、兼容汉字）时才翻译；纯数字/公式/单位/拉丁文原样保留
_CJK = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uF900-\uFAFF]")
def has_cjk(s: str) -> bool:
    return bool(_CJK.search(s))

# 英文高价值术语校正（在 zh->en 之后、中转之前应用，惠及所有目标语）
EN_FIX = [
    ("Body Quality Index", "Body Mass Index"),
    ("Body Quality", "Body Mass"),
    ("obese screening", "obesity screening"),
    ("public or English", "metric or imperial"),
]
def fix_en(s: str) -> str:
    for a, b in EN_FIX:
        if a in s:
            s = s.replace(a, b)
    return s

def load(path):
    with io.open(path, encoding="utf-8") as f:
        return json.load(f, object_pairs_hook=collections.OrderedDict)

def dump(path, obj):
    with io.open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")

_at = None
_L = None
def _ensure():
    global _at, _L
    if _at is None:
        import argostranslate.translate as at
        at.load_installed_languages()
        _at = at
        _L = {l.code: l for l in at.get_installed_languages()}
    return _at

def _translator(fr, to):
    return _L[fr].get_translation(_L[to])

def mt_batch(texts, fr, to, batch_size=BATCH):
    """手动拼接批量翻译，返回与 texts 等长的列表。"""
    if not texts:
        return []
    tr = _translator(fr, to)
    out = []
    for i in range(0, len(texts), batch_size):
        chunk = texts[i:i + batch_size]
        joined = "\n".join(chunk)
        res = tr.translate(joined)
        parts = res.split("\n")
        if len(parts) == len(chunk):
            out.extend(parts)
        else:
            # 对齐失败：回退逐句
            out.extend([tr.translate(s) for s in chunk])
    return out

_en_map = {}
_cache = {}

def build_maps(src_strings):
    uniq = list(dict.fromkeys(s for s in src_strings if s))
    print(f"  去重后待译中文串 {len(uniq)} 个", flush=True)
    t0 = time.time()
    en_out = mt_batch(uniq, "zh", "en")
    for s, d in zip(uniq, en_out):
        _en_map[s] = fix_en(d) if (d and d.strip()) else s
    for lang in ("de", "ja", "es"):
        vals = [_en_map[s] for s in uniq]
        out = mt_batch(vals, "en", lang)
        for s, d in zip(uniq, out):
            _cache[(lang, s)] = d if (d and d.strip()) else _en_map[s]
    for s in uniq:
        _cache[("en", s)] = _en_map[s]
    print(f"  映射构建完成，耗时 {time.time()-t0:.1f}s", flush=True)

def t(lang, s):
    if not isinstance(s, str) or not has_cjk(s):
        return s
    return _cache.get((lang, s), s)

def translate_guide(guide, lang):
    ng = collections.OrderedDict()
    for k, v in guide.items():
        if k == "steps":
            ng[k] = [t(lang, x) for x in v]
        elif k in ("explanationTitle", "formula", "tableTitle"):
            ng[k] = t(lang, v)
        elif k == "explanation":
            ng[k] = [t(lang, x) for x in v]
        elif k == "faq":
            lst = []
            for f in v:
                nf = collections.OrderedDict()
                for fk, fv in f.items():
                    nf[fk] = t(lang, fv)
                lst.append(nf)
            ng[k] = lst
        elif k == "tableHeaders":
            ng[k] = [t(lang, x) for x in v]
        elif k == "tableRows":
            ng[k] = [[t(lang, c) for c in row] for row in v]
        else:
            ng[k] = v
    return ng

def collect_strings(guide):
    out = []
    for k, v in guide.items():
        if k == "steps":
            out += [x for x in v if has_cjk(x)]
        elif k in ("explanationTitle", "formula", "tableTitle"):
            if has_cjk(v): out.append(v)
        elif k == "explanation":
            out += [x for x in v if has_cjk(x)]
        elif k == "faq":
            for f in v:
                for fv in f.values():
                    if has_cjk(fv): out.append(fv)
        elif k == "tableHeaders":
            out += [x for x in v if has_cjk(x)]
        elif k == "tableRows":
            for row in v:
                out += [c for c in row if has_cjk(c)]
    return out

def thin_ids_of(conv):
    ids = []
    for tid, tool in conv.items():
        g = tool.get("guide")
        if isinstance(g, dict) and len(json.dumps(g, ensure_ascii=False)) < 1000:
            ids.append(tid)
    return ids

def main():
    _ensure()
    TEST = "--test" in sys.argv
    LIMIT = 3 if TEST else None
    zh = load(f"{BASE}/{SRC}.json")
    zh_conv = zh.get("converter", {})

    src_strings = []
    per_lang = {}
    for lang in TARGETS:
        data = load(f"{BASE}/{lang}.json")
        conv = data.get("converter", {})
        ids = thin_ids_of(conv)
        if LIMIT is not None:
            ids = ids[:LIMIT]
        per_lang[lang] = (data, conv, ids)
        for tid in ids:
            zg = zh_conv.get(tid, {}).get("guide")
            if isinstance(zg, dict):
                src_strings += collect_strings(zg)
            ztool = zh_conv.get(tid, {})
            for fld in ("name", "description", "metaDescription"):
                val = ztool.get(fld)
                if isinstance(val, str) and has_cjk(val):
                    src_strings.append(val)
    build_maps(src_strings)

    for lang in TARGETS:
        data, conv, ids = per_lang[lang]
        print(f"=== {lang}: 处理 {len(ids)} 个 ===", flush=True)
        if TEST:
            sample = conv[ids[0]]["guide"] if ids else None
            if sample:
                print("  [TEST] 工具:", ids[0])
                print("  explanationTitle:", sample.get("explanationTitle"))
                print("  formula:", sample.get("formula"))
                print("  steps[0]:", sample.get("steps", [""])[0])
                print("  faq[0].q:", sample.get("faq", [{}])[0].get("q"))
            continue
        done = 0
        for tid in ids:
            ztool = zh_conv.get(tid)
            if not isinstance(ztool, dict) or not isinstance(ztool.get("guide"), dict):
                continue
            conv[tid]["guide"] = translate_guide(ztool["guide"], lang)
            for fld in ("name", "description", "metaDescription"):
                val = conv[tid].get(fld)
                if isinstance(val, str) and has_cjk(val):
                    conv[tid][fld] = t(lang, val)
            done += 1
        dump(f"{BASE}/{lang}.json", data)
        remain = len(thin_ids_of(conv))
        print(f"  已重建 {done} 个，剩余薄 {remain} 个 -> 写入 {lang}.json", flush=True)

if __name__ == "__main__":
    main()
