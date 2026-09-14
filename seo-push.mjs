// seo-push.mjs — 部署后主动推送 URL 给搜索引擎，加速收录。
//
// 解决的问题（用户反馈：Google 能搜到，Bing/百度 搜不到）：
//   1) IndexNow -> Bing / Yandex / Seznam 实时发现新 URL（无需等爬虫）
//   2) 百度站长主动推送 API -> 比手动提交 sitemap 快得多
//
// 用法（在 `next build` + deploy 之后运行）：
//   node seo-push.mjs
//
// 环境变量（不要硬编码，放 shell / CI secret）：
//   SITE_URL            默认 https://baikecalc.com
//   INDEXNOW_KEY        你的 IndexNow key（同时在 public/<key>.txt 放同值以验证）
//   BAIDU_SITE         百度资源平台验证的站点（如 https://baikecalc.com）
//   BAIDU_TOKEN        百度主动推送 token（平台 -> 数据引入 -> 链接提交 -> 接口调用地址里）
//
// 任一推送的凭证缺失时，该通道自动跳过并提示，不影响另一通道。

import fs from "node:fs";
import path from "node:path";

// 极简 .env 加载（不依赖 dotenv 包）：把 .env 注入 process.env（仅在未设置时覆盖），
// 这样任意机器直接 `node seo-push.mjs` 即可，无需先 export 变量。
try {
  const envText = fs.readFileSync(".env", "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const SITE = (process.env.SITE_URL ?? "https://baikecalc.com").replace(/\/$/, "");
const OUT_DIR = path.join(process.cwd(), "out");
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "";
const BAIDU_SITE = process.env.BAIDU_SITE ?? "";
const BAIDU_TOKEN = process.env.BAIDU_TOKEN ?? "";

// 递归收集 out/ 下所有 index.html，映射成线上 URL（trailing slash）。
function collectUrls(dir, base = "") {
  const urls = [];
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return urls;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("__next") || e.name === "404") continue;
      urls.push(...collectUrls(full, `${base}/${e.name}`));
    } else if (e.name === "index.html") {
      urls.push(`${SITE}${base}/`);
    }
  }
  return urls;
}

const urls = collectUrls(OUT_DIR);
console.log(`[seo-push] collected ${urls.length} URLs from ${OUT_DIR}`);

// ---- IndexNow (Bing / Yandex / Seznam) ----
// Bing 建议避免一次性提交超大批量的 "Batch Mode"：改为每批 50 条流式提交，
// 既降低单次请求体积，也避免触发 "Avoid IndexNow Batch Mode" 警告。
const INDEXNOW_BATCH = 50;
async function pushIndexNow() {
  if (!INDEXNOW_KEY) {
    console.log("[seo-push] INDEXNOW_KEY 未设置，跳过 IndexNow");
    return;
  }
  const host = new URL(SITE).host;
  const keyLocation = `${SITE}/${INDEXNOW_KEY}.txt`;
  let ok = 0;
  let fail = 0;
  const total = Math.ceil(urls.length / INDEXNOW_BATCH);
  for (let i = 0; i < urls.length; i += INDEXNOW_BATCH) {
    const batch = urls.slice(i, i + INDEXNOW_BATCH);
    const body = JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList: batch,
    });
    const idx = i / INDEXNOW_BATCH + 1;
    try {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const text = await res.text();
      console.log(
        `[seo-push] IndexNow 批次 ${idx}/${total} (${batch.length} urls) -> ${res.status} ${text}`,
      );
      if (res.ok) ok += batch.length;
      else fail += batch.length;
    } catch (err) {
      console.log(`[seo-push] IndexNow 批次 ${idx} 失败: ${err.message}`);
      fail += batch.length;
    }
    // 批次间小延时，避免触发限流
    if (i + INDEXNOW_BATCH < urls.length) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  console.log(
    `[seo-push] IndexNow 完成: 成功 ${ok} / 失败 ${fail} / 共 ${urls.length}`,
  );
}

// ---- 百度主动推送 ----
// 百度单次接口上限约 2000 条，这里按 1000 条分批提交更稳。
const BAIDU_BATCH = 1000;
async function pushBaidu() {
  if (!BAIDU_SITE || !BAIDU_TOKEN) {
    console.log("[seo-push] BAIDU_SITE/BAIDU_TOKEN 未设置，跳过百度推送");
    return;
  }
  // 百度主动推送 API 域名是 data.zz.baidu.com（不是 ziyuan.baidu.com——
  // 后者是 Web 界面，直接 POST 会返回登录页 HTML 而非 JSON）。
  const endpoint = `https://data.zz.baidu.com/urls?site=${encodeURIComponent(
    BAIDU_SITE,
  )}&token=${BAIDU_TOKEN}`;
  let ok = 0;
  let fail = 0;
  const total = Math.ceil(urls.length / BAIDU_BATCH);
  for (let i = 0; i < urls.length; i += BAIDU_BATCH) {
    const batch = urls.slice(i, i + BAIDU_BATCH);
    const idx = i / BAIDU_BATCH + 1;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: batch.join("\n"),
      });
      const text = await res.text();
      console.log(
        `[seo-push] 百度推送 批次 ${idx}/${total} (${batch.length} urls) -> ${res.status} ${text}`,
      );
      if (res.ok) ok += batch.length;
      else fail += batch.length;
    } catch (err) {
      console.log(`[seo-push] 百度推送 批次 ${idx} 失败: ${err.message}`);
      fail += batch.length;
    }
    if (i + BAIDU_BATCH < urls.length) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  console.log(
    `[seo-push] 百度推送完成: 成功 ${ok} / 失败 ${fail} / 共 ${urls.length}`,
  );
}

await pushIndexNow();
await pushBaidu();
console.log("[seo-push] done");
