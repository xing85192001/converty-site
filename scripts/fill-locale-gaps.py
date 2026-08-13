#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fill missing i18n message keys for locales that fall back to English.

Missing-key gaps (vs en.json) for the affected locales:
  de (50): calculator(24) + common(12) + converter(14)
  fr (50): calculator(24) + common(12) + converter(14)
  it (36): calculator(24) + common(12)
  es (16): calculator(2)  + converter(14)
  ja (16): calculator(2)  + converter(14)
  ko (16): calculator(2)  + converter(14)
  ru (2):  calculator(2)
  zh-TW (2): calculator(2)
  zh (15): common(1) + nav(14)   [+ 11 corrupted ICU tokens fixed separately]
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MSG = os.path.join(ROOT, "src", "messages")

# ---- translations: locale -> dotted_key -> value -------------------------
T = {}

T["de"] = {
    # calculator.bandwidthUnits (symbols kept universal)
    "calculator.bandwidthUnits.Bps": "B/s",
    "calculator.bandwidthUnits.GBps": "GB/s",
    "calculator.bandwidthUnits.KBps": "KB/s",
    "calculator.bandwidthUnits.MBps": "MB/s",
    "calculator.bandwidthUnits.bps": "bps",
    "calculator.bandwidthUnits.gbps": "Gbps",
    "calculator.bandwidthUnits.kbps": "Kbps",
    "calculator.bandwidthUnits.mbps": "Mbps",
    # calculator.dataSize
    "calculator.dataSize.binaryUnits": "Binäre Einheiten (1024-basiert)",
    "calculator.dataSize.bytes": "Byte",
    "calculator.dataSize.decimalUnits": "Dezimaleinheiten (1000-basiert)",
    "calculator.dataSize.gibibytes": "Gibibyte",
    "calculator.dataSize.gigabytes": "Gigabyte",
    "calculator.dataSize.kibibytes": "Kibibyte",
    "calculator.dataSize.kilobytes": "Kilobyte",
    "calculator.dataSize.mebibytes": "Mebibyte",
    "calculator.dataSize.megabytes": "Megabyte",
    "calculator.dataSize.note": "Hinweis: Dezimaleinheiten (KB, MB, GB) verwenden die Basis 1000, während binäre Einheiten (KiB, MiB, GiB) die Basis 1024 verwenden. Speicherhersteller verwenden meist dezimale Einheiten, während Betriebssysteme oft binäre Einheiten nutzen.",
    "calculator.dataSize.tebibytes": "Tebibyte",
    "calculator.dataSize.terabytes": "Terabyte",
    # calculator.labels
    "calculator.labels.bitsPerSecond": "Bits pro Sekunde",
    "calculator.labels.bytesPerSecond": "Byte pro Sekunde",
    "calculator.labels.dataTransferOverTime": "Datentransfer über die Zeit",
    "calculator.labels.unit": "Einheit",
    # common
    "common.allCategories": "📂 Alle Kategorien",
    "common.colorHealthTools": "🎨 Farb- & Gesundheitswerkzeuge",
    "common.financeComingSoon": "Finanzrechner kommen bald!",
    "common.homepageBrowseAll": "Alle Werkzeuge durchsuchen",
    "common.homepageTitle": "Kostenlose Online-Toolbox",
    "common.homepageViewAll": "Alle ansehen →",
    "common.hotTools": "🔥 Beliebte Werkzeuge",
    "common.hotToolsChips.all": "Alle",
    "common.hotToolsChips.basic": "Basis",
    "common.hotToolsChips.datetime": "Datum & Zeit",
    "common.hotToolsChips.percentage": "Prozent",
    "common.hotToolsChips.unit": "Einheitenrechner",
    # converter.programmer-calculator
    "converter.programmer-calculator.bitwise": "Bitweise Operation",
    "converter.programmer-calculator.left": "Links (<<)",
    "converter.programmer-calculator.none": "Keine",
    "converter.programmer-calculator.reprA": "A-Darstellungen",
    "converter.programmer-calculator.reprB": "B-Darstellungen",
    "converter.programmer-calculator.right": "Rechts (>>)",
    "converter.programmer-calculator.shift": "Verschieben",
    "converter.programmer-calculator.valueA": "Wert A",
    "converter.programmer-calculator.valueB": "Wert B",
    # converter.unit-converter
    "converter.unit-converter.category": "Kategorie",
    "converter.unit-converter.from": "Von",
    "converter.unit-converter.swap": "Tauschen",
    "converter.unit-converter.to": "Nach",
    "converter.unit-converter.value": "Wert",
}

T["fr"] = {
    "calculator.dataSize.binaryUnits": "Unités binaires (base 1024)",
    "calculator.dataSize.bytes": "Octets",
    "calculator.dataSize.decimalUnits": "Unités décimales (base 1000)",
    "calculator.dataSize.gibibytes": "Gibioctets",
    "calculator.dataSize.gigabytes": "Gigaoctets",
    "calculator.dataSize.kibibytes": "Kibioctets",
    "calculator.dataSize.kilobytes": "Kiloctets",
    "calculator.dataSize.mebibytes": "Mébioctets",
    "calculator.dataSize.megabytes": "Mégaoctets",
    "calculator.dataSize.note": "Remarque : les unités décimales (Ko, Mo, Go) utilisent la base 1000, tandis que les unités binaires (Kio, Mio, Gio) utilisent la base 1024. Les fabricants de stockage utilisent généralement des unités décimales, alors que les systèmes d’exploitation utilisent souvent des unités binaires.",
    "calculator.dataSize.tebibytes": "Tébioctets",
    "calculator.dataSize.terabytes": "Téraoctets",
    "calculator.labels.bitsPerSecond": "Bits par seconde",
    "calculator.labels.bytesPerSecond": "Octets par seconde",
    "calculator.labels.dataTransferOverTime": "Transfert de données dans le temps",
    "calculator.labels.unit": "Unité",
    "common.allCategories": "📂 Toutes les catégories",
    "common.colorHealthTools": "🎨 Outils couleur et santé",
    "common.financeComingSoon": "Calculateurs financiers bientôt disponibles !",
    "common.homepageBrowseAll": "Parcourir tous les outils",
    "common.homepageTitle": "Boîte à outils en ligne gratuite",
    "common.homepageViewAll": "Voir tout →",
    "common.hotTools": "🔥 Outils populaires",
    "common.hotToolsChips.all": "Tous",
    "common.hotToolsChips.basic": "Basique",
    "common.hotToolsChips.datetime": "Date et heure",
    "common.hotToolsChips.percentage": "Pourcentage",
    "common.hotToolsChips.unit": "Convertisseur d’unités",
    "converter.programmer-calculator.bitwise": "Opération bit à bit",
    "converter.programmer-calculator.left": "Gauche (<<)",
    "converter.programmer-calculator.none": "Aucun",
    "converter.programmer-calculator.reprA": "Représentations A",
    "converter.programmer-calculator.reprB": "Représentations B",
    "converter.programmer-calculator.right": "Droite (>>)",
    "converter.programmer-calculator.shift": "Décalage",
    "converter.programmer-calculator.valueA": "Valeur A",
    "converter.programmer-calculator.valueB": "Valeur B",
    "converter.unit-converter.category": "Catégorie",
    "converter.unit-converter.from": "De",
    "converter.unit-converter.swap": "Échanger",
    "converter.unit-converter.to": "À",
    "converter.unit-converter.value": "Valeur",
    # bandwidthUnits kept universal (same as en)
    "calculator.bandwidthUnits.Bps": "B/s",
    "calculator.bandwidthUnits.GBps": "GB/s",
    "calculator.bandwidthUnits.KBps": "KB/s",
    "calculator.bandwidthUnits.MBps": "MB/s",
    "calculator.bandwidthUnits.bps": "bps",
    "calculator.bandwidthUnits.gbps": "Gbps",
    "calculator.bandwidthUnits.kbps": "Kbps",
    "calculator.bandwidthUnits.mbps": "Mbps",
}

T["it"] = {
    "calculator.dataSize.binaryUnits": "Unità binarie (base 1024)",
    "calculator.dataSize.bytes": "Byte",
    "calculator.dataSize.decimalUnits": "Unità decimali (base 1000)",
    "calculator.dataSize.gibibytes": "Gibibyte",
    "calculator.dataSize.gigabytes": "Gigabyte",
    "calculator.dataSize.kibibytes": "Kibibyte",
    "calculator.dataSize.kilobytes": "Kilobyte",
    "calculator.dataSize.mebibytes": "Mebibyte",
    "calculator.dataSize.megabytes": "Megabyte",
    "calculator.dataSize.note": "Nota: le unità decimali (KB, MB, GB) usano la base 1000, mentre le unità binarie (KiB, MiB, GiB) usano la base 1024. I produttori di memoria usano solitamente unità decimali, mentre i sistemi operativi usano spesso unità binarie.",
    "calculator.dataSize.tebibytes": "Tebibyte",
    "calculator.dataSize.terabytes": "Terabyte",
    "calculator.labels.bitsPerSecond": "Bit per secondo",
    "calculator.labels.bytesPerSecond": "Byte per secondo",
    "calculator.labels.dataTransferOverTime": "Trasferimento dati nel tempo",
    "calculator.labels.unit": "Unità",
    "common.allCategories": "📂 Tutte le categorie",
    "common.colorHealthTools": "🎨 Strumenti colore e salute",
    "common.financeComingSoon": "Calcolatrici finanziarie in arrivo!",
    "common.homepageBrowseAll": "Sfoglia tutti gli strumenti",
    "common.homepageTitle": "Toolbox online gratuita",
    "common.homepageViewAll": "Vedi tutto →",
    "common.hotTools": "🔥 Strumenti popolari",
    "common.hotToolsChips.all": "Tutti",
    "common.hotToolsChips.basic": "Base",
    "common.hotToolsChips.datetime": "Data e ora",
    "common.hotToolsChips.percentage": "Percentuale",
    "common.hotToolsChips.unit": "Convertitore di unità",
    "calculator.bandwidthUnits.Bps": "B/s",
    "calculator.bandwidthUnits.GBps": "GB/s",
    "calculator.bandwidthUnits.KBps": "KB/s",
    "calculator.bandwidthUnits.MBps": "MB/s",
    "calculator.bandwidthUnits.bps": "bps",
    "calculator.bandwidthUnits.gbps": "Gbps",
    "calculator.bandwidthUnits.kbps": "Kbps",
    "calculator.bandwidthUnits.mbps": "Mbps",
}

T["es"] = {
    "calculator.automotive.tireSizing.warningTolerance3": "La diferencia de diámetro supera el 3 % y puede afectar la precisión del velocímetro",
    "calculator.automotive.tireSizing.warningTolerance5": "La diferencia de diámetro supera el 5 % y puede afectar significativamente el velocímetro, el ABS y el control de tracción",
    "converter.programmer-calculator.bitwise": "Operación bit a bit",
    "converter.programmer-calculator.left": "Izquierda (<<)",
    "converter.programmer-calculator.none": "Ninguno",
    "converter.programmer-calculator.reprA": "Representaciones A",
    "converter.programmer-calculator.reprB": "Representaciones B",
    "converter.programmer-calculator.right": "Derecha (>>)",
    "converter.programmer-calculator.shift": "Desplazamiento",
    "converter.programmer-calculator.valueA": "Valor A",
    "converter.programmer-calculator.valueB": "Valor B",
    "converter.unit-converter.category": "Categoría",
    "converter.unit-converter.from": "De",
    "converter.unit-converter.swap": "Intercambiar",
    "converter.unit-converter.to": "A",
    "converter.unit-converter.value": "Valor",
}

T["ja"] = {
    "calculator.automotive.tireSizing.warningTolerance3": "直径の差が3%を超えています。速度計の精度に影響する可能性があります",
    "calculator.automotive.tireSizing.warningTolerance5": "直径の差が5%を超えています。速度計、ABS、トラクションコントロールに大きく影響する可能性があります",
    "converter.programmer-calculator.bitwise": "ビット演算",
    "converter.programmer-calculator.left": "左シフト (<<)",
    "converter.programmer-calculator.none": "なし",
    "converter.programmer-calculator.reprA": "Aの表現",
    "converter.programmer-calculator.reprB": "Bの表現",
    "converter.programmer-calculator.right": "右シフト (>>)",
    "converter.programmer-calculator.shift": "シフト",
    "converter.programmer-calculator.valueA": "値 A",
    "converter.programmer-calculator.valueB": "値 B",
    "converter.unit-converter.category": "カテゴリ",
    "converter.unit-converter.from": "変換元",
    "converter.unit-converter.swap": "入れ替え",
    "converter.unit-converter.to": "変換先",
    "converter.unit-converter.value": "値",
}

T["ko"] = {
    "calculator.automotive.tireSizing.warningTolerance3": "지름 차이가 3%를 초과하여 속도계 정확도에 영향을 줄 수 있습니다",
    "calculator.automotive.tireSizing.warningTolerance5": "지름 차이가 5%를 초과하여 속도계, ABS 및 트랙션 컨트롤에 상당한 영향을 줄 수 있습니다",
    "converter.programmer-calculator.bitwise": "비트 연산",
    "converter.programmer-calculator.left": "왼쪽 시프트 (<<)",
    "converter.programmer-calculator.none": "없음",
    "converter.programmer-calculator.reprA": "A 표현",
    "converter.programmer-calculator.reprB": "B 표현",
    "converter.programmer-calculator.right": "오른쪽 시프트 (>>)",
    "converter.programmer-calculator.shift": "시프트",
    "converter.programmer-calculator.valueA": "값 A",
    "converter.programmer-calculator.valueB": "값 B",
    "converter.unit-converter.category": "범주",
    "converter.unit-converter.from": "변환 전",
    "converter.unit-converter.swap": "교환",
    "converter.unit-converter.to": "변환 후",
    "converter.unit-converter.value": "값",
}

T["ru"] = {
    "calculator.automotive.tireSizing.warningTolerance3": "Разница диаметров превышает 3% — это может повлиять на точность спидометра",
    "calculator.automotive.tireSizing.warningTolerance5": "Разница диаметров превышает 5% — это может существенно повлиять на спидометр, ABS и систему контроля тяги",
}

T["zh-TW"] = {
    "calculator.automotive.tireSizing.warningTolerance3": "直徑差異超過 3%，可能影響速度表準確度",
    "calculator.automotive.tireSizing.warningTolerance5": "直徑差異超過 5%，可能顯著影響速度表、ABS 與循跡控制系統",
}

T["zh"] = {
    "common.footer.copyright": "版权所有",
    "nav.chemistry.subcategories.general": "常规",
    "nav.chemistry.subcategories.reactions": "反应",
    "nav.chemistry.subcategories.reference": "参考",
    "nav.chemistry.subcategories.solutions": "溶液",
    "nav.engineering.subcategories.conversion": "转换",
    "nav.engineering.subcategories.hydraulics": "液压",
    "nav.engineering.subcategories.materials": "材料",
    "nav.engineering.subcategories.structural": "结构",
    "nav.infrastructure.subcategories.cost": "成本分析",
    "nav.infrastructure.subcategories.cpu": "CPU 性能",
    "nav.infrastructure.subcategories.hyperv": "Hyper-V",
    "nav.infrastructure.subcategories.kubernetes": "Kubernetes",
    "nav.infrastructure.subcategories.vmware": "VMware",
    "nav.music.comingSoon": "音乐计算器即将推出！",
}

# ---- zh.json corrupted ICU tokens (variable names got mixed with Chinese) --
ZH_FIX = {
    "calculator.time.yearsMonthsDays": "{years} 年 {months} 个月 {days} 天",
    "calculator.time.hoursMinutesSeconds": "{hours} 小时 {minutes} 分 {seconds} 秒",
    "calculator.time.daysAgo": "{days} 天前",
    "calculator.time.daysUntil": "{days} 天后",
    "calculator.finance.yearsMonthsFormat": "{years} 年 {months} 个月",
    "calculator.finance.yearsCount": "{count, plural, =1 {1 年} other {# 年}}",
    "calculator.finance.yearsToRetirement": "在 {years} 年后，年龄 {age} 岁",
    "calculator.inflation.inYearsNeed": "{years} 年后，你将需要",
    "calculator.inflation.todayEquivalent": "{amount} 相当于今天的价值",
    "calculator.crypto.exchange.hoursAgo": "{hours} 小时前",
    "calculator.crypto.mining.hoursAgo": "{hours} 小时前",
}


def set_nested(d, dotted, value):
    parts = dotted.split(".")
    cur = d
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


def main():
    total = 0
    for loc, mapping in T.items():
        path = os.path.join(MSG, loc + ".json")
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        for k, v in mapping.items():
            set_nested(data, k, v)
            total += 1
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=False)
            f.write("\n")
        print(f"  {loc}.json: +{len(mapping)} keys")

    # zh corrupted fix
    zpath = os.path.join(MSG, "zh.json")
    with open(zpath, encoding="utf-8") as f:
        zdata = json.load(f)
    zfix = 0
    for k, v in ZH_FIX.items():
        set_nested(zdata, k, v)
        zfix += 1
    with open(zpath, "w", encoding="utf-8") as f:
        json.dump(zdata, f, ensure_ascii=False, indent=2, sort_keys=False)
        f.write("\n")
    print(f"  zh.json: fixed {zfix} corrupted ICU tokens")
    print(f"TOTAL keys written: {total + zfix}")


if __name__ == "__main__":
    main()
