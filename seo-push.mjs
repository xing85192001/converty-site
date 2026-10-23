// seo-push.mjs — 部署后主动推送 URL 给搜索引擎，加速收录。
//
// 推送通道（三条，互相独立，任一凭证缺失自动跳过）：
//   1) IndexNow  -> 一次 POST 覆盖 6 家引擎（见下方说明）
//   2) 百度主动推送 API
//   3) Wayback Machine SPN2 -> 让第三方抓取器真实抓取一次页面
//      （默认关闭：archive.org 在中国大陆直连超时，需代理，用 --wayback 开启）
//
// ---- 关于 IndexNow 的实际覆盖面（重要，别被旧注释误导）----
// 官方 https://www.indexnow.org/faq 明确写着：
//   "只需提交到下列任意一个端点，内容会自动共享给所有参与 IndexNow 的搜索引擎。"
// 参与端点与引擎：
//   https://api.indexnow.org/indexnow           全球中转端点（本脚本用这个）
//   https://indexnow.amazonbot.amazon/indexnow  Amazon
//   https://www.bing.com/indexnow               Bing
//   https://searchadvisor.naver.com/indexnow    Naver（韩国）
//   https://search.seznam.cz/indexnow           Seznam.cz（捷克）
//   https://yandex.com/indexnow                 Yandex
//   https://indexnow.yep.com/indexnow           Yep
// 即：提交到 api.indexnow.org 一次 = Amazon/Bing/Naver/Seznam/Yandex/Yep 六家同时收到。
// 另外 DuckDuckGo / Copilot / ChatGPT Search 吃 Bing 的索引，属间接覆盖。
// 不参与 IndexNow 的：Google（Indexing API 仅限 JobPosting/BroadcastEvent）、
// Brave（无站长平台、无 sitemap 提交、无 IndexNow）。
//
// ---- 增量推送 ----
// IndexNow 官方：只应提交"近期新增/更新/删除"的 URL，不适合每次全量重推。
// 本脚本对每个页面算一个"内容签名"（剔除 script/style/link 与空白，
// 因此构建产生的 chunk hash 变化不会误判为内容变化），只推送签名变了的页面。
//   - 首次运行（无状态文件）       -> 自动全量
//   - 距上次全量超过 30 天         -> 自动全量（兜底刷新）
//   - 其余情况                     -> 只推变化的页面
//
// 用法（在 `next build` + deploy 之后运行）：
//   node seo-push.mjs                     增量推送（IndexNow + 百度）
//   node seo-push.mjs --wayback           额外推送 Wayback（需代理，大陆直连不通）
//   node seo-push.mjs --full              强制全量
//   node seo-push.mjs --incremental       强制只用增量
//   node seo-push.mjs --wayback-limit=50  限制 Wayback 本次抓取条数
//   node seo-push.mjs --dry-run           只统计并打印，不发任何请求
//
// 环境变量（不要硬编码，放 shell / CI secret；也可写在 .env）：
//   SITE_URL            默认 https://baikecalc.com
//   INDEXNOW_KEY        你的 IndexNow key（同时在 public/<key>.txt 放同值以验证）
//   BAIDU_SITE          百度资源平台验证的站点（如 https://baikecalc.com）
//   BAIDU_TOKEN         百度主动推送 token
//   FULL_REFRESH_DAYS   多久做一次全量兜底推送，默认 30
//   WAYBACK=1           启用 Wayback 通道（等价于 --wayback）
//   WAYBACK_LIMIT       单次 Wayback 抓取上限，默认 150
//   WAYBACK_CONCURRENCY Wayback 并发数，默认 4（匿名上限 6）

import crypto from "node:crypto";
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

// ---- CLI ----
const argv = process.argv.slice(2);
const hasFlag = (name) => argv.includes(`--${name}`);
const getOpt = (name, dflt) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : dflt;
};

const DRY_RUN = hasFlag("dry-run");
const ENABLE_WAYBACK = hasFlag("wayback") || process.env.WAYBACK === "1";
const FORCE_FULL = hasFlag("full");
const FORCE_INCREMENTAL = hasFlag("incremental");

// ---- 配置 ----
const SITE = (process.env.SITE_URL ?? "https://baikecalc.com").replace(/\/$/, "");
const OUT_DIR = path.join(process.cwd(), "out");
const STATE_FILE = path.join(process.cwd(), ".seo-push-state.json");
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "";
const BAIDU_SITE = process.env.BAIDU_SITE ?? "";
const BAIDU_TOKEN = process.env.BAIDU_TOKEN ?? "";
const FULL_REFRESH_DAYS = Number(process.env.FULL_REFRESH_DAYS ?? 30);
const WAYBACK_LIMIT = Number(getOpt("wayback-limit", process.env.WAYBACK_LIMIT ?? 150));
const WAYBACK_CONCURRENCY = Number(process.env.WAYBACK_CONCURRENCY ?? 4);
// Wayback 整体时间预算：超时后停止启动新任务，避免定时任务被拖成几十分钟。
const WAYBACK_TIME_BUDGET_MS = 10 * 60 * 1000;

// ---- 页面收集 + 内容签名 ----
// 只比对"可见内容"，剔除 <script> / <link> / 注释：
//   1) Next.js 每次构建都会变 _next/static 的 chunk hash，若对整段 HTML 取哈希，
//      任何一次 rebuild 都会让全部页面被判定为"已变化"，增量就失效了；
//   2) 每页 90% 以上的体积是内联 RSC 脚本（含整份 i18n 字典），跟页面内容无关。
//
// 关于只读 256KB 前缀：实测本站单页平均 1.2MB、合计约 2GB，全量读入要 4 分钟
// （杀软逐文件扫描拖慢），而剔除脚本后的可见内容仅约 95KB、99.96% 落在前 256KB 内。
// 因此只读前缀，既能准确反映内容变化，又把读取量从 2GB 降到约 450MB。
// 极端情况下正文尾部（<256KB 之外）的改动会漏判，用 --full 可强制全量兜底。
const SIG_PREFIX_BYTES = 256 * 1024;

// 用 indexOf 扫描跳过整段 script/link/comment，再增量喂给哈希。
// 不用正则：对 1MB 级的 800KB 内联脚本跑惰性量词正则会明显变慢。
function contentSignature(html) {
  const hash = crypto.createHash("sha1");
  const n = html.length;
  let i = 0;
  let seg = 0;
  while (i < n) {
    if (html.charCodeAt(i) === 60 /* < */) {
      let end = -1;
      if (html.startsWith("<script", i)) {
        const e = html.indexOf("</script>", i);
        end = e === -1 ? n : e + "</script>".length;
      } else if (html.startsWith("<link", i)) {
        const e = html.indexOf(">", i);
        end = e === -1 ? n : e + 1;
      } else if (html.startsWith("<!--", i)) {
        const e = html.indexOf("-->", i);
        end = e === -1 ? n : e + 3;
      }
      if (end !== -1) {
        if (i > seg) hash.update(html.slice(seg, i));
        i = end;
        seg = end;
        continue;
      }
    }
    i += 1;
  }
  if (n > seg) hash.update(html.slice(seg));
  return hash.digest("hex").slice(0, 16);
}

// 有界读取：只读文件前 maxBytes 字节。
function readPrefix(file, maxBytes) {
  const fd = fs.openSync(file, "r");
  try {
    const buf = Buffer.alloc(maxBytes);
    const n = fs.readSync(fd, buf, 0, maxBytes, 0);
    return buf.subarray(0, n).toString("utf8");
  } finally {
    fs.closeSync(fd);
  }
}

// 递归收集 out/ 下所有 index.html，映射成线上 URL（trailing slash）+ 内容签名。
function collectPages(dir, base = "") {
  const pages = [];
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return pages;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("__next") || e.name === "404") continue;
      pages.push(...collectPages(full, `${base}/${e.name}`));
    } else if (e.name === "index.html") {
      let sig = "";
      try {
        sig = contentSignature(readPrefix(full, SIG_PREFIX_BYTES));
      } catch {
        sig = "read-error";
      }
      pages.push({ url: `${SITE}${base}/`, sig });
    }
  }
  return pages;
}

// ---- 状态文件（增量推送的基准）----
// 不进 git（见 .gitignore）：本机定时任务靠它判断"哪些页面变了"。
// 换机器 / 首次运行没有它 -> 自动全量，安全兜底。
function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return {
      version: 1,
      lastFullPush: raw.lastFullPush ?? null,
      urls: raw.urls ?? {},
    };
  } catch {
    return { version: 1, lastFullPush: null, urls: {} };
  }
}

function saveState(state) {
  if (DRY_RUN) return;
  try {
    fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  } catch (err) {
    console.log(`[seo-push] 状态文件写入失败（不影响本次推送）: ${err.message}`);
  }
}

const state = loadState();
const pages = collectPages(OUT_DIR);
console.log(`[seo-push] collected ${pages.length} URLs from ${OUT_DIR}`);

// ---- 决定全量 / 增量 ----
function decideMode() {
  if (FORCE_FULL) return { mode: "full", reason: "--full" };
  if (FORCE_INCREMENTAL) return { mode: "incremental", reason: "--incremental" };
  if (!state.lastFullPush) return { mode: "full", reason: "无状态文件（首次运行）" };
  const last = Date.parse(state.lastFullPush);
  if (!Number.isFinite(last)) return { mode: "full", reason: "状态文件时间戳无效" };
  const days = (Date.now() - last) / 86400000;
  if (days >= FULL_REFRESH_DAYS) {
    return { mode: "full", reason: `距上次全量 ${days.toFixed(1)} 天 ≥ ${FULL_REFRESH_DAYS} 天` };
  }
  return { mode: "incremental", reason: `距上次全量 ${days.toFixed(1)} 天` };
}

const { mode, reason } = decideMode();
const previousUrls = state.urls ?? {};
const currentUrlSet = new Set(pages.map((p) => p.url));
const removedUrls = Object.keys(previousUrls).filter((u) => !currentUrlSet.has(u));

let targets;
if (mode === "full") {
  targets = pages;
} else {
  targets = pages.filter((p) => previousUrls[p.url] !== p.sig);
}

console.log(`[seo-push] 模式: ${mode}（${reason}）`);
console.log(
  `[seo-push] 本次待推送 ${targets.length} 条 / 全站 ${pages.length} 条` +
    (mode === "incremental" ? `（未变化 ${pages.length - targets.length} 条）` : ""),
);
if (removedUrls.length > 0) {
  console.log(
    `[seo-push] 注意: 有 ${removedUrls.length} 个旧 URL 本次已不在 out/ 中（不自动推送删除，需人工确认是否该提交 404）`,
  );
}

const urls = targets.map((p) => p.url);
const okUrls = new Set();

// ---- IndexNow（一次覆盖 Amazon / Bing / Naver / Seznam / Yandex / Yep）----
// 官方单次上限 10000 条，但 Bing 建议避免一次性超大批量的 "Batch Mode"，
// 因此按 50 条流式提交，降低单次体积、也避免触发 "Avoid IndexNow Batch Mode" 警告。
const INDEXNOW_BATCH = 50;
async function pushIndexNow(list) {
  if (!INDEXNOW_KEY) {
    console.log("[seo-push] INDEXNOW_KEY 未设置，跳过 IndexNow");
    return;
  }
  if (list.length === 0) {
    console.log("[seo-push] IndexNow -> skipped（没有需要推送的 URL）");
    return;
  }
  const host = new URL(SITE).host;
  const keyLocation = `${SITE}/${INDEXNOW_KEY}.txt`;
  let ok = 0;
  let fail = 0;
  const total = Math.ceil(list.length / INDEXNOW_BATCH);
  for (let i = 0; i < list.length; i += INDEXNOW_BATCH) {
    const batch = list.slice(i, i + INDEXNOW_BATCH);
    const body = JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation, urlList: batch });
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
      if (res.ok) {
        ok += batch.length;
        for (const u of batch) okUrls.add(u);
      } else {
        fail += batch.length;
      }
    } catch (err) {
      console.log(`[seo-push] IndexNow 批次 ${idx} 失败: ${err.message}`);
      fail += batch.length;
    }
    if (i + INDEXNOW_BATCH < list.length) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  console.log(`[seo-push] IndexNow 完成: 成功 ${ok} / 失败 ${fail} / 共 ${list.length}`);
  // 保留这行便于定时任务做判据匹配。
  if (fail === 0) console.log("[seo-push] IndexNow -> 200");
  else console.log(`[seo-push] IndexNow -> 部分失败（失败 ${fail} 条）`);
}

// ---- 百度主动推送 ----
// 百度单次接口上限约 2000 条，这里按 1000 条分批提交更稳。
const BAIDU_BATCH = 1000;
async function pushBaidu(list) {
  if (!BAIDU_SITE || !BAIDU_TOKEN) {
    console.log("[seo-push] BAIDU_SITE/BAIDU_TOKEN 未设置，跳过百度推送");
    return;
  }
  if (list.length === 0) {
    console.log("[seo-push] 百度推送 -> skipped（没有需要推送的 URL）");
    return;
  }
  // 百度主动推送 API 域名是 data.zz.baidu.com（不是 ziyuan.baidu.com——
  // 后者是 Web 界面，直接 POST 会返回登录页 HTML 而非 JSON）。
  const endpoint = `https://data.zz.baidu.com/urls?site=${encodeURIComponent(
    BAIDU_SITE,
  )}&token=${BAIDU_TOKEN}`;
  let ok = 0;
  let fail = 0;
  const total = Math.ceil(list.length / BAIDU_BATCH);
  for (let i = 0; i < list.length; i += BAIDU_BATCH) {
    const batch = list.slice(i, i + BAIDU_BATCH);
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
      if (res.ok) {
        ok += batch.length;
        // IndexNow 未配置时，让百度作为增量基准的来源。
        if (!INDEXNOW_KEY) for (const u of batch) okUrls.add(u);
      } else {
        fail += batch.length;
      }
    } catch (err) {
      console.log(`[seo-push] 百度推送 批次 ${idx} 失败: ${err.message}`);
      fail += batch.length;
    }
    if (i + BAIDU_BATCH < list.length) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  console.log(`[seo-push] 百度推送完成: 成功 ${ok} / 失败 ${fail} / 共 ${list.length}`);
}

// ---- Wayback Machine（Save Page Now 2）----
// 不是搜索引擎，但是真实的第三方抓取：让 Brozzler 实际抓一遍页面，
// 既留下永久快照，也给站点增加一次外部抓取信号。无需 API key。
// 匿名限额：并发 6、每日 4000 次。这里默认并发 4、单次上限 150 条，
// 并用 if_not_archived_within=30d 跳过 30 天内已存档的页面，减少无谓抓取。
//
// 默认关闭：archive.org 在中国大陆网络下直连会超时（UND_ERR_CONNECT_TIMEOUT），
// 需要代理才能用。要启用请加 --wayback 或设 WAYBACK=1。
async function pushWayback(list) {
  if (!ENABLE_WAYBACK) {
    console.log(
      "[seo-push] Wayback 未启用（默认关闭；需要代理才能连 archive.org，用 --wayback 开启）",
    );
    return;
  }
  if (list.length === 0) {
    console.log("[seo-push] Wayback -> skipped（没有需要推送的 URL）");
    return;
  }
  const batch = list.slice(0, WAYBACK_LIMIT);
  if (batch.length < list.length) {
    console.log(
      `[seo-push] Wayback 本次只抓前 ${batch.length} 条（上限 ${WAYBACK_LIMIT}，剩余 ${list.length - batch.length} 条留待下次）`,
    );
  }

  const deadline = Date.now() + WAYBACK_TIME_BUDGET_MS;
  let ok = 0;
  let fail = 0;
  let skippedByTime = 0;
  let cursor = 0;
  // 一旦判定"网络层面根本连不上"，立刻停止，不要把 150 条逐个超时。
  let unreachable = "";

  async function worker() {
    while (true) {
      if (unreachable) return;
      if (Date.now() > deadline) {
        skippedByTime += 1;
        return;
      }
      const i = cursor;
      cursor += 1;
      if (i >= batch.length) return;
      const u = batch[i];
      const form = new URLSearchParams({
        url: u,
        // 30 天内已存档过就跳过，避免重复抓取浪费配额。
        if_not_archived_within: "30d",
        // 延迟 ~12 小时再对外可见，降低 Archive 侧负载。
        delay_wb_availability: "1",
      });
      try {
        const res = await fetch("https://web.archive.org/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: form,
          signal: AbortSignal.timeout(45000),
        });
        const text = (await res.text()).slice(0, 200);
        if (res.ok) {
          ok += 1;
        } else {
          fail += 1;
        }
        console.log(`[seo-push] Wayback ${i + 1}/${batch.length} -> ${res.status} ${text}`);
      } catch (err) {
        const code = err.cause?.code ?? "";
        if (
          code === "UND_ERR_CONNECT_TIMEOUT" ||
          code === "ENOTFOUND" ||
          code === "ECONNREFUSED" ||
          code === "ETIMEDOUT"
        ) {
          unreachable = code;
          return;
        }
        fail += 1;
        console.log(`[seo-push] Wayback ${i + 1}/${batch.length} 失败: ${err.message}`);
      }
      // 轻微间隔，避免瞬时打满匿名并发额度。
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  const workers = Array.from({ length: Math.max(1, WAYBACK_CONCURRENCY) }, () => worker());
  await Promise.all(workers);

  if (unreachable) {
    console.log(
      `[seo-push] Wayback 已中止：连不上 web.archive.org（${unreachable}）。` +
        "archive.org 在中国大陆直连不通，需要代理；本次不影响 IndexNow / 百度。",
    );
    return;
  }
  console.log(
    `[seo-push] Wayback 完成: 成功 ${ok} / 失败 ${fail} / 共 ${batch.length}` +
      (skippedByTime > 0 ? `（超时预算，${skippedByTime} 条未发起）` : ""),
  );
}

// ---- 执行 ----
if (DRY_RUN) {
  console.log("[seo-push] --dry-run：以下为计划，不发送任何请求，也不写状态文件");
  console.log(`[seo-push] 计划推送 ${urls.length} 条 -> IndexNow / 百度 / Wayback`);
  process.exit(0);
}

await pushIndexNow(urls);
await pushBaidu(urls);
await pushWayback(urls);

// ---- 更新状态：只为"真正推送成功"的 URL 记录签名 ----
// 失败的 URL 不落状态，下次会自然重试。
for (const p of targets) {
  if (okUrls.has(p.url)) state.urls[p.url] = p.sig;
}
// 清理已不存在的页面，避免状态文件无限膨胀。
for (const u of removedUrls) delete state.urls[u];
if (mode === "full" && okUrls.size > 0) state.lastFullPush = new Date().toISOString();
saveState(state);

console.log(
  `[seo-push] 状态: 已记录 ${Object.keys(state.urls).length} 条签名` +
    (state.lastFullPush ? ` / 上次全量 ${state.lastFullPush}` : "") +
    ` / 本次成功 ${okUrls.size}`,
);
console.log("[seo-push] done");
