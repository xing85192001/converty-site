// push-baidu.mjs — 一键百度主动推送（独立脚本，不依赖本地 out/ 目录）。
//
// 从线上 sitemap.xml 抓取全部 URL，批量 POST 给百度站长主动推送 API。
// 解决沙箱网络阻断百度 API 的问题：在你本机（能直连 data.zz.baidu.com）运行即可。
//
// 用法：
//   node push-baidu.mjs
// 凭证已内置（如更换 token，改下方 BAIDU_TOKEN 常量即可）。

// 注意：百度 API 的 site 参数必须是不带协议前缀的裸域名（如 baikecalc.com），
// 带 https:// 会返回 {"error":400,"message":"site init fail"}。
const BAIDU_SITE = "baikecalc.com";
const BAIDU_TOKEN = "9RdiFJCL42As3A1d";
const SITEMAP_URL = "https://baikecalc.com/sitemap.xml";

// 从 sitemap.xml 解析所有 <loc>URL</loc>
async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`sitemap 抓取失败 HTTP ${res.status}`);
  const xml = await res.text();
  // 支持嵌套 sitemapindex（<loc> 指向子 sitemap）和直接 urlset
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  // 如果这是 sitemapindex（含 .xml 子项且本身不含普通页面 url），递归抓取子 sitemap
  const isIndex = /<sitemapindex/i.test(xml);
  if (isIndex) {
    const urls = [];
    for (const sub of locs) {
      if (!sub.endsWith(".xml")) {
        urls.push(sub);
        continue;
      }
      const r2 = await fetch(sub);
      if (!r2.ok) continue;
      const x2 = await r2.text();
      for (const m of x2.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1].trim());
    }
    return urls;
  }
  return locs;
}

async function main() {
  console.log(`[push-baidu] 从 ${SITEMAP_URL} 抓取 URL 列表...`);
  let urls;
  try {
    urls = await fetchSitemapUrls();
  } catch (err) {
    console.error(`[push-baidu] 失败: ${err.message}`);
    process.exit(1);
  }
  console.log(`[push-baidu] 共 ${urls.length} 个 URL`);

  if (urls.length === 0) {
    console.error("[push-baidu] 未解析到任何 URL，终止");
    process.exit(1);
  }

  const params = `site=${encodeURIComponent(BAIDU_SITE)}&token=${BAIDU_TOKEN}`;

  // 打印代理变量（方便排查）
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  if (proxy) console.log(`[push-baidu] 检测到代理: ${proxy}`);

  // 先 https，失败再试 http（有些网络/ISP 只封 443，80 可通）
  const endpoints = [
    `https://data.zz.baidu.com/urls?${params}`,
    `http://data.zz.baidu.com/urls?${params}`,
  ];

  let lastErr;
  for (const ep of endpoints) {
    try {
      console.log(`[push-baidu] 尝试 ${ep.split("?")[0]}...`);
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: urls.join("\n"),
      });
      const text = await res.text();
      console.log(`[push-baidu] 百度 API -> HTTP ${res.status}`);
      console.log(`[push-baidu] 返回: ${text}`);
      // 百度成功返回示例: {"success":1436,"remain":49999564}
      if (res.ok && text.includes("success")) {
        console.log("[push-baidu] ✅ 推送成功");
        return;
      }
      console.log("[push-baidu] ⚠️ 请检查返回内容（可能 token 无效或站点未验证）");
      return;
    } catch (err) {
      lastErr = err;
      console.log(`[push-baidu] 该端点失败: ${err.message}`);
    }
  }

  console.error("[push-baidu] 所有端点均失败，无法连接百度 API");
  console.error("[push-baidu] 可能原因：");
  console.error("  1) 本机网络/防火墙/代理阻断了 data.zz.baidu.com");
  console.error("  2) 百度 API 当前对你的网络不可达（可尝试 VPN/切换网络）");
  console.error("  3) 备用方案：在百度资源平台手动粘贴 sitemap URL 提交");
  process.exit(1);
}

main();
