#!/usr/bin/env python3
"""Fill disclaimers + advertisement for zh (Simplified) and zh-TW (Traditional).
The main script was interrupted before reaching these two locales. We provide
hand-written natural Chinese rather than machine-translated text.
"""
import json
import os
from pathlib import Path

MSG_DIR = Path(__file__).resolve().parent.parent / "src" / "messages"

ZH = {
    "advertisement": "广告",
    "disclaimers": {
        "finance": "本站计算器仅提供一般性估算与参考信息，不构成任何金融、投资、税务或法律建议。在做出任何决定前，请咨询合格的专业人士。",
        "health": "本计算器仅提供一般性信息，不能替代专业医疗建议、诊断或治疗。请务必咨询合格的医疗提供者。",
        "crypto": "这些工具仅供教育与信息参考之用，不构成任何投资、交易或金融建议。加密货币风险极高，请务必自行研究。",
    },
}

ZHTW = {
    "advertisement": "廣告",
    "disclaimers": {
        "finance": "本站計算器僅提供一般性估算與參考資訊，不構成任何金融、投資、稅務或法律建議。在做出任何決定前，請諮詢合格的專業人士。",
        "health": "本計算器僅提供一般性資訊，不能替代專業醫療建議、診斷或治療。請務必諮詢合格的醫療提供者。",
        "crypto": "這些工具僅供教育與資訊參考之用，不構成任何投資、交易或金融建議。加密貨幣風險極高，請務必自行研究。",
    },
}


def write(locale, data):
    path = MSG_DIR / f"{locale}.json"
    tmp = path.with_suffix(".json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


for loc, payload in (("zh", ZH), ("zh-TW", ZHTW)):
    d = json.load(open(MSG_DIR / f"{loc}.json", encoding="utf-8"))
    d.setdefault("common", {})["advertisement"] = payload["advertisement"]
    d["disclaimers"] = payload["disclaimers"]
    write(loc, d)
    print(f"{loc}: disclaimers + advertisement written (hand-written Chinese)")
