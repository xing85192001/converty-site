import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();
const en = JSON.parse(readFileSync(resolve(root, "src/messages/en.json"), "utf-8"));
const zh = structuredClone(en);

// UI strings translation
zh.common = {
  ...zh.common,
  siteName: "转换",
  tagline: "免费在线计算器与转换工具，满足日常需求",
  allTools: "所有工具",
  home: "首页",
  search: {
    placeholder: "搜索计算器……",
    noResults: "未找到相关计算器",
    calculators: "计算器",
    loading: "搜索中……",
    hint: "进行搜索",
  },
  loading: "加载中",
  error: "出错了",
  close: "关闭",
  copy: "复制",
  copied: "已复制",
  reset: "重置",
  calculate: "计算",
  every: "每",
  or: "或",
  clear: "清除",
  selectLanguage: "选择语言",
  at: "在",
  duration: "时长",
  start: "开始",
  end: "结束",
  blog: "博客",
  footer: {
    builtWith: "使用 Next.js 与 Tailwind CSS 构建",
    copyright: "版权所有",
    links: {
      privacy: "隐私政策",
      about: "关于我们",
      contact: "联系我们",
      terms: "服务条款",
      blog: "博客",
    },
  },
  navigation: {
    categories: "分类",
    featured: "精选工具",
    moreTools: "更多工具",
  },
  toast: {
    copySuccess: "已复制到剪贴板",
    copyError: "复制失败",
    csvExportSuccess: "CSV 导出成功",
    csvExportError: "CSV 导出失败",
    pdfExportSuccess: "PDF 导出成功",
    pdfExportError: "PDF 导出失败",
    calculationError: "无法计算，请检查输入",
  },
  validation: {
    required: "此项必填",
    invalidNumber: "请输入有效数字",
    positiveNumber: "请输入正数",
    invalidDate: "请输入有效日期",
    endDateAfterStart: "结束日期必须晚于开始日期",
    invalidUrl: "请输入有效网址",
  },
  metadata: {
    titleSuffix: "转换",
    defaultDescription: "免费在线计算器与转换工具，满足日常需求",
  },
  cookieConsent: {
    title: "我们重视您的隐私",
    description:
      "我们使用 Cookie 来改善您的体验，并提供个性化广告。您可以随时接受或拒绝非必要 Cookie。",
    accept: "全部接受",
    decline: "拒绝",
    manage: "管理",
  },
};

// Category names/descriptions (zh)
const categoryTranslations = {
  color: { name: "颜色", description: "颜色转换与计算" },
  cooking: { name: "烹饪", description: "食谱缩放与营养计算器" },
  crypto: { name: "加密货币", description: "加密货币与挖矿计算器" },
  data: { name: "数据", description: "数据单位与校验计算器" },
  datetime: { name: "日期时间", description: "日期、时间与年龄计算器" },
  finance: { name: "财务", description: "贷款、利息与投资计算器" },
  health: { name: "健康", description: "健康与健身计算器" },
  infrastructure: { name: "基础设施", description: "建筑与工程计算器" },
  engineering: { name: "工程", description: "电气、机械与其他工程计算器" },
  chemistry: { name: "化学", description: "化学与摩尔计算器" },
  math: { name: "数学", description: "数学与统计计算器" },
  music: { name: "音乐", description: "音乐理论、音频与节拍计算器" },
  network: { name: "网络", description: "网络、IP 与下载计算器" },
  photo: { name: "摄影", description: "摄影、打印与 DPI 计算器" },
  physics: { name: "物理", description: "物理与单位换算" },
  realestate: { name: "房地产", description: "房贷、租金与房产计算器" },
  video: { name: "视频", description: "视频、帧率与文件大小计算器" },
  web: { name: "网页", description: "CSS、Typography 与网页开发计算器" },
  automotive: { name: "汽车", description: "油耗、速度与汽车计算器" },
  subcategories: zh.nav.subcategories,
};
zh.nav = categoryTranslations;

// Blog UI strings
zh.blog = {
  title: "文章与指南",
  subtitle: "关于金钱、健康和日常数学的实用解说，配合我们的免费计算器。",
  readMore: "阅读更多",
  publishedOn: "发表于",
  minRead: "分钟阅读",
  backToBlog: "返回博客",
  all: "全部",
  category: "分类",
};

// Keep converter/calculator namespaces in English as a pragmatic fallback
// (translating 167+ calculators is out of scope for this change).

writeFileSync(resolve(root, "src/messages/zh.json"), JSON.stringify(zh, null, 2) + "\n");
console.log("Created src/messages/zh.json");
