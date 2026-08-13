#!/usr/bin/env python3
"""Verify every required mediaTools key exists in all locale files."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = ROOT / "src" / "messages"
LOCALES = ["ar","cs","de","el","en","es","fr","hu","id","it","ja","ko","ms","nl","pt","ru","th","tr","uk","vi","zh","zh-TW"]

# Required keys per namespace (dotted paths under mediaTools)
REQUIRED = {
    "sectionTitle": None, "sectionSubtitle": None, "featuredTitle": None, "allCategories": None,
    "categories.all": None, "categories.watermark": None, "categories.format": None,
    "categories.icon": None, "categories.compress": None,
    "videoWatermark.title": None, "videoWatermark.desc": None,
    "imageWatermark.title": None, "imageWatermark.desc": None,
    "ico.title": None, "ico.desc": None,
    "formatConvert.title": None, "formatConvert.desc": None,
    "imageCompress.title": None, "imageCompress.desc": None,
    "videoCompress.title": None, "videoCompress.desc": None,
    "imageUpscale.title": None, "imageUpscale.desc": None,
    "imageToPdf.title": None, "imageToPdf.desc": None,
    "fileDrop.clickOrDrag": None, "fileDrop.supports": None,
    "videoWatermarkRemover.title": None, "videoWatermarkRemover.description": None,
    "videoWatermarkRemover.selectVideo": None, "videoWatermarkRemover.originalLabel": None,
    "videoWatermarkRemover.removeBtn": None, "videoWatermarkRemover.previewTitle": None,
    "videoWatermarkRemover.aiBadge": None, "videoWatermarkRemover.emptyPreview": None,
    "videoWatermarkRemover.processing": None, "videoWatermarkRemover.startRemoval": None,
    "videoWatermarkRemover.download": None, "videoWatermarkRemover.errorSelectArea": None,
    "videoWatermarkRemover.errorFailed": None, "videoWatermarkRemover.hint": None,
    "imageWatermarkRemover.loadError": None, "imageWatermarkRemover.canvasError": None,
    "imageWatermarkRemover.processError": None, "imageWatermarkRemover.hint": None,
    "imageWatermarkRemover.processBtn": None, "imageWatermarkRemover.resultTitle": None,
    "imageWatermarkRemover.downloadBtn": None,
    "icoConverter.loadError": None, "icoConverter.processError": None,
    "icoConverter.generateBtn": None, "icoConverter.downloadBtn": None,
    "formatConverter.loadError": None, "formatConverter.canvasError": None,
    "formatConverter.convertError": None, "formatConverter.unsupportedFormat": None,
    "formatConverter.outputFormat": None, "formatConverter.convertBtn": None,
    "formatConverter.downloadBtn": None,
    "imageCompressor.loadError": None, "imageCompressor.canvasError": None,
    "imageCompressor.compressError": None, "imageCompressor.qualityLabel": None,
    "imageCompressor.scaleLabel": None, "imageCompressor.sizeCompare": None,
    "imageCompressor.compressBtn": None, "imageCompressor.downloadBtn": None,
    "videoCompressor.title": None, "videoCompressor.description": None,
    "videoCompressor.selectVideo": None, "videoCompressor.originalLabel": None,
    "videoCompressor.removeBtn": None, "videoCompressor.settingsTitle": None,
    "videoCompressor.resolutionLabel": None, "videoCompressor.originalResolution": None,
    "videoCompressor.res1080p": None, "videoCompressor.res720p": None,
    "videoCompressor.res480p": None, "videoCompressor.res360p": None,
    "videoCompressor.crfLabel": None, "videoCompressor.crfHint": None,
    "videoCompressor.processing": None, "videoCompressor.processBtn": None,
    "videoCompressor.uploadFirstError": None, "videoCompressor.processError": None,
    "videoCompressor.downloadBtn": None,
    "imageUpscaler.loadError": None, "imageUpscaler.canvasError": None,
    "imageUpscaler.upscaleError": None, "imageUpscaler.scaleLabel": None,
    "imageUpscaler.sharpenLabel": None, "imageUpscaler.upscaleBtn": None,
    "imageUpscaler.downloadBtn": None,
    "imageToPdf.loadError": None, "imageToPdf.canvasError": None,
    "imageToPdf.readError": None, "imageToPdf.pdfError": None,
    "imageToPdf.mergeBtn": None, "imageToPdf.downloadBtn": None,
}

def get(d, path):
    cur = d
    for p in path.split("."):
        if not isinstance(cur, dict) or p not in cur:
            return False
        cur = cur[p]
    return True

problems = 0
for loc in LOCALES:
    path = MESSAGES / f"{loc}.json"
    if not path.exists():
        print(f"{loc}: FILE MISSING")
        problems += 1
        continue
    data = json.loads(path.read_text(encoding="utf-8"))
    mt = data.get("mediaTools")
    if not isinstance(mt, dict):
        print(f"{loc}: mediaTools MISSING")
        problems += 1
        continue
    missing = [k for k in REQUIRED if not get(mt, k)]
    if missing:
        problems += len(missing)
        print(f"{loc}: MISSING {len(missing)} -> {missing[:8]}{'...' if len(missing)>8 else ''}")
    else:
        print(f"{loc}: OK (all {len(REQUIRED)} keys)")

print(f"\nTOTAL PROBLEMS: {problems}")
