#!/usr/bin/env python3
"""Add common.copySuccess / common.copyError to all locales and translate."""
import json
from pathlib import Path

import importlib.util

spec = importlib.util.spec_from_file_location("tr", "scripts/translate_all.py")
tr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tr)

LOCALES = ["ar", "cs", "de", "el", "es", "fr", "hu", "id", "it", "ja", "ko", "ms", "nl", "pt", "ru", "th", "tr", "uk", "vi", "zh", "zh-TW"]
MESSAGES_DIR = Path("src/messages")
EN = json.loads((MESSAGES_DIR / "en.json").read_text(encoding="utf-8"))

success_en = "Copied to clipboard"
error_en = "Failed to copy to clipboard"

EN.setdefault("common", {})["copySuccess"] = success_en
EN["common"]["copyError"] = error_en
(MESSAGES_DIR / "en.json").write_text(json.dumps(EN, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Updated en.json")

for loc in LOCALES:
    msg_path = MESSAGES_DIR / f"{loc}.json"
    data = json.loads(msg_path.read_text(encoding="utf-8"))
    common = data.setdefault("common", {})
    tl = {"zh": "zh-CN", "zh-TW": "zh-TW", "ms": "ms"}.get(loc, loc)
    mapping = tr.batch_worker([success_en, error_en], tl)
    common["copySuccess"] = mapping[success_en]
    common["copyError"] = mapping[error_en]
    msg_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {loc}: {common['copySuccess']} / {common['copyError']}")
