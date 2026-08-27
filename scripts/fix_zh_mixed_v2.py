#!/usr/bin/env python3
"""Fix zh.json entries with mixed Chinese + English words."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "src" / "messages"

CJK = re.compile(r"[\u4e00-\u9fff]")
# English word immediately adjacent to CJK (either direction)
MIXED_ADJACENT = re.compile(r"[a-zA-Z]{3,}[\u4e00-\u9fff]|[\u4e00-\u9fff][a-zA-Z]{3,}")
# Common abbreviations/brands that are allowed to sit next to CJK
ALLOWED_ABBREVS = {
    "JPEG", "PDF", "MP4", "MOV", "WebM", "JPG", "PNG", "WEBP", "BMP", "GIF",
    "CHF", "EUR", "USD", "COGS", "APR", "SPEC", "URL", "HTTP", "HTTPS", "API",
    "AI", "HD", "ICO", "CSV", "CSS", "HTML", "JS", "TS", "VPN", "IP", "IPv4",
    "IPv6", "CIDR", "VLAN", "DHCP", "DNS", "TCP", "UDP", "FTP", "SSH", "SSL",
    "TLS", "VM", "VMware", "VCF", "VVF", "ESX", "Hyper", "Windows", "Server",
    "CPU", "GPU", "RAM", "SSD", "HDD", "TB", "GB", "MB", "KB", "Mbps", "Gbps",
    "Kbps", "bps", "KiB", "MiB", "GiB", "TiB", "L", "km", "MPG", "AISC", "BB",
    "CKD", "HELOC", "DC", "STD", "TCO", "CAPEX", "OPEX", "PUE", "Ru", "FOS",
    "MDS", "ISL", "FC", "NFS", "iSCSI", "SAN", "NAS", "VDI", "RDS", "SQL",
    "NoSQL", "JSON", "XML", "YAML", "CLI", "GUI", "UI", "UX", "OS", "ISO",
    "UTC", "GMT", "AM", "PM", "BMI", "BMR", "BAC", "GFR", "CKD", "BSA",
}


def has_real_mix(val: str) -> bool:
    if not CJK.search(val):
        return False
    for m in MIXED_ADJACENT.finditer(val):
        # Check whether the adjacent Latin part is just an allowed abbrev
        latin = re.search(r"[a-zA-Z]+", m.group(0))
        if latin and latin.group(0).upper() in ALLOWED_ABBREVS:
            continue
        return True
    return False


def flatten(obj, prefix=""):
    items = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            items.update(flatten(v, f"{prefix}.{k}" if prefix else k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            items.update(flatten(v, f"{prefix}[{i}]"))
    elif isinstance(obj, str):
        items[prefix] = obj
    return items


def unflatten(flat):
    out = {}
    for key, val in flat.items():
        parts = key.split(".")
        cur = out
        for p in parts[:-1]:
            if p not in cur or not isinstance(cur[p], dict):
                cur[p] = {}
            cur = cur[p]
        cur[parts[-1]] = val
    return out


def main():
    en = json.loads((MESSAGES / "en.json").read_text(encoding="utf-8"))
    zh = json.loads((MESSAGES / "zh.json").read_text(encoding="utf-8"))
    en_flat = flatten(en)
    zh_flat = flatten(zh)

    fixed = 0
    for key, val in zh_flat.items():
        if has_real_mix(val):
            if key in en_flat:
                zh_flat[key] = en_flat[key]
                fixed += 1
            else:
                print(f"Warning: no en fallback for {key}: {val!r}")

    zh = unflatten(zh_flat)
    (MESSAGES / "zh.json").write_text(
        json.dumps(zh, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Fixed {fixed} mixed Chinese/English entries in zh.json")


if __name__ == "__main__":
    main()
