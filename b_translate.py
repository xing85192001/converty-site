"""B 层内容生成：离线翻译辅助（argos + opencc）。

zh -> en (argos zh_en)
en -> de/ja/es (argos en_de/en_ja/en_es)
zh -> zh-TW (opencc s2twp)

translate_zh(zh) 返回 {en, de, ja, es, zhTW}
"""
import argostranslate.package
import argostranslate.translate

argostranslate.package.update_package_index()
_LANGS = {l.code: l for l in argostranslate.translate.get_installed_languages()}
_TR_CACHE = {}


def _translator(from_code, to_code):
    key = (from_code, to_code)
    if key not in _TR_CACHE:
        src = _LANGS.get(from_code)
        tgt = _LANGS.get(to_code)
        tr = None
        if src is not None and tgt is not None:
            try:
                tr = src.get_translation(tgt)
            except Exception:
                tr = None
        _TR_CACHE[key] = tr
    return _TR_CACHE[key]


def _batch(tr, text):
    """多句用换行拼接一次推理，再切回，提速。空行保留。"""
    if tr is None:
        return text
    parts = text.split("\n")
    joined = "\n".join(parts)
    out = tr.translate(joined)
    out_parts = out.split("\n")
    if len(out_parts) == len(parts):
        return out
    # 切分不对齐则整段回退
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


def translate_zh(zh):
    """zh 文本 -> 五种语言字典。"""
    en = to_en(zh)
    return {
        "en": en,
        "de": to_de(en),
        "ja": to_ja(en),
        "es": to_es(en),
        "zhTW": to_zhtw(zh),
    }


if __name__ == "__main__":
    r = translate_zh("身体质量指数是衡量体重与身高关系的常用指标。\n它可以帮助判断是否存在超重风险。")
    for k, v in r.items():
        print(f"[{k}] {v}")
