const fs = require("fs");
const path = require("path");

const dir = path.resolve(__dirname, "../src/messages");
const locales = [
  "ar",
  "cs",
  "de",
  "el",
  "en",
  "es",
  "fr",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "ms",
  "nl",
  "pt",
  "ru",
  "th",
  "tr",
  "uk",
  "vi",
  "zh-TW",
  "zh",
];

const zh = {
  formatConverter: {
    multiImageHint: "选择多张图片可生成 GIF 动画（可设置帧延迟）。",
    frameDelay: "帧延迟",
    addMore: "添加更多图片",
    removeFile: "移除",
  },
  videoToGif: {
    title: "视频转 GIF",
    description: "上传视频，调整帧率与宽度，一键转换为动图 GIF。",
    selectVideo: "选择视频",
    originalLabel: "原视频",
    removeBtn: "移除",
    convertBtn: "开始转换",
    converting: "转换中…",
    phaseLoadingEngine: "正在加载处理引擎…",
    phaseConverting: "正在转换为 GIF…",
    processing: "处理中 {progress}%",
    fpsLabel: "帧率",
    widthLabel: "宽度",
    previewTitle: "GIF 预览",
    emptyPreview: "转换后的 GIF 将显示在这里",
    download: "下载 GIF",
    errorEmpty: "输出文件为空",
    errorNetwork: "网络错误：下载处理核心失败，请检查网络后重试。",
    errorFailed: "转换失败，请重试",
  },
};

const en = {
  formatConverter: {
    multiImageHint: "Select multiple images to create an animated GIF (frame delay adjustable).",
    frameDelay: "Frame delay",
    addMore: "Add more images",
    removeFile: "Remove",
  },
  videoToGif: {
    title: "Video to GIF",
    description:
      "Upload a video, adjust FPS and width, and convert it to an animated GIF in one click.",
    selectVideo: "Select video",
    originalLabel: "Original video",
    removeBtn: "Remove",
    convertBtn: "Start conversion",
    converting: "Converting…",
    phaseLoadingEngine: "Loading processing engine…",
    phaseConverting: "Converting to GIF…",
    processing: "Processing {progress}%",
    fpsLabel: "FPS",
    widthLabel: "Width",
    previewTitle: "GIF preview",
    emptyPreview: "The converted GIF will appear here",
    download: "Download GIF",
    errorEmpty: "Output file is empty",
    errorNetwork:
      "Network error: failed to download the processing core. Check your connection and retry.",
    errorFailed: "Conversion failed, please retry",
  },
};

function pick(locale) {
  if (locale === "zh" || locale === "zh-TW") return zh;
  return en; // English fallback for the remaining 20 locales (no translator available in this env)
}

let ok = 0;
for (const loc of locales) {
  const file = path.join(dir, `${loc}.json`);
  if (!fs.existsSync(file)) {
    console.log("SKIP missing", file);
    continue;
  }
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  const v = pick(loc);
  json.mediaTools = json.mediaTools || {};
  json.mediaTools.formatConverter = {
    ...(json.mediaTools.formatConverter || {}),
    ...v.formatConverter,
  };
  json.mediaTools.videoToGif = v.videoToGif;
  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  ok++;
}
console.log(`Patched ${ok} locale files.`);
