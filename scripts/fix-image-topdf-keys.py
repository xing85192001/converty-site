#!/usr/bin/env python3
"""Merge card title/desc into the mediaTools.imageToPdf namespace for every locale.

Bug: the translation dicts defined `imageToPdf` twice (card title/desc AND
component strings), so Python collapsed the key and dropped title/desc.
The registry looks up `mediaTools.imageToPdf.title` / `.desc`.
Also: locales with no mediaTools at all get a full English copy so every key exists.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "src" / "messages"

# Card title/desc per locale for imageToPdf.
IMAGE_TO_PDF = {
    "en": ("Image to PDF", "Merge multiple images into a single PDF file."),
    "zh": ("图片转 PDF", "将多张图片合并为一个 PDF 文件。"),
    "zh-TW": ("圖片轉 PDF", "將多張圖片合併為一個 PDF 檔案。"),
    "ko": ("이미지를 PDF로", "여러 이미지를 하나의 PDF 파일로 병합합니다."),
    "ja": ("画像を PDF に", "複数の画像を 1 つの PDF ファイルに結合。"),
    "de": ("Bild zu PDF", "Mehrere Bilder in eine einzige PDF-Datei zusammenführen."),
    "fr": ("Image vers PDF", "Fusionnez plusieurs images en un seul fichier PDF."),
    "it": ("Immagine in PDF", "Unisci più immagini in un unico file PDF."),
    "es": ("Imagen a PDF", "Combina varias imágenes en un solo archivo PDF."),
    "pt": ("Imagem para PDF", "Une várias imagens em um único arquivo PDF."),
    "ru": ("Изображение в PDF", "Объедините несколько изображений в один PDF-файл."),
    "vi": ("Ảnh sang PDF", "Gộp nhiều ảnh thành một file PDF duy nhất."),
    "id": ("Gambar ke PDF", "Gabungkan beberapa gambar menjadi satu file PDF."),
    "ms": ("Imej ke PDF", "Gabungkan beberapa imej menjadi satu fail PDF."),
    "nl": ("Afbeelding naar PDF", "Voeg meerdere afbeeldingen samen tot één PDF-bestand."),
    "tr": ("Görselden PDF'ye", "Birden fazla görseli tek bir PDF dosyasında birleştirin."),
    # Locales without a mediaTools namespace yet -> use English (the default fallback).
    "ar": ("Image to PDF", "Merge multiple images into a single PDF file."),
    "cs": ("Image to PDF", "Merge multiple images into a single PDF file."),
    "el": ("Image to PDF", "Merge multiple images into a single PDF file."),
    "hu": ("Image to PDF", "Merge multiple images into a single PDF file."),
    "th": ("Image to PDF", "Merge multiple images into a single PDF file."),
    "uk": ("Image to PDF", "Merge multiple images into a single PDF file."),
}

# Locales that have NO mediaTools at all -> seed with full English namespace.
NO_MEDIATOOLS = ["ar", "cs", "el", "hu", "th", "uk"]


def main():
    en_path = MESSAGES / "en.json"
    en_data = json.loads(en_path.read_text(encoding="utf-8"))
    en_media = en_data["mediaTools"]

    for locale, (title, desc) in IMAGE_TO_PDF.items():
        path = MESSAGES / f"{locale}.json"
        if not path.exists():
            print(f"SKIP (missing): {locale}")
            continue
        data = json.loads(path.read_text(encoding="utf-8"))

        if locale in NO_MEDIATOOLS or "mediaTools" not in data:
            # Seed full English namespace then overwrite the card title/desc.
            media = json.loads(json.dumps(en_media))
            media.setdefault("imageToPdf", {})
            media["imageToPdf"]["title"] = title
            media["imageToPdf"]["desc"] = desc
            data["mediaTools"] = media
            print(f"SEEDED+title: {locale}")
        else:
            media = data["mediaTools"]
            itp = media.setdefault("imageToPdf", {})
            itp["title"] = title
            itp["desc"] = desc
            print(f"MERGED title: {locale}")

        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("DONE")


if __name__ == "__main__":
    main()
