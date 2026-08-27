# baikecalc.com 自己部署指南（Cloudflare Pages 静态导出）

> 适用对象：在 Windows 本机、Git Bash / PowerShell 操作。  
> 源码目录（唯一正确）：`C:\Users\admin\Desktop\kaifa\converty-site`  
> 部署脚本（唯一正确）：`C:\Users\admin\Desktop\kaifa\deploy_force3.mjs`

---

## 一、核心命令（两步走）

```bash
# 1) 进入源码目录，重新构建
cd /c/Users/admin/Desktop/kaifa/converty-site
rm -rf out .next
NODE_OPTIONS= node node_modules/next/dist/bin/next build

# 2) 部署到 Cloudflare Pages（注意第 2 个参数必须是 out 目录！）
NODE_OPTIONS= HTTPS_PROXY= HTTP_PROXY= \
  node /c/Users/admin/Desktop/kaifa/deploy_force3.mjs \
       baikecalc \
       /c/Users/admin/Desktop/kaifa/converty-site/out
```

构建约 6 分钟，部署约 20 分钟（14000+ 文件，BLAKE3 协议）。

---

## 二、为什么不能直接 `npm run build` / `npx next build`

- **NODE_OPTIONS 冲突**：运行环境会自动注入 `--use-system-ca`，Next 16 的 Turbopack Worker 会拒绝它（`ERR_WORKER_INVALID_EXEC_ARGV`）。所以构建前必须 `NODE_OPTIONS=` 清空。
- **必须直接调 bin**：`npm run build` 会重新注入上面的环境变量，导致失败。要用 `node node_modules/next/dist/bin/next build`。
- **部署脚本默认 out 指向已删除的旧目录 `build6tmp`**，不传第 2 参数会报错/部署错目录。所以第 2 参数必须 `converty-site/out`。

---

## 三、改代码后必须确认的 4 件事（否则线上缺文件）

1. **`next.config.ts` 里要有 `turbopack.root: __dirname`**（已在仓库修好）。  
   缺失会报：`directory ... contains package-lock.json`（Next 16 误把 Desktop 当根）。
2. **`src/i18n/` 下只能有 `navigation.ts`，不能有 `navigation.tsx`**（之前误建了一个引用不存在 `./routing` 的版本，会 build 失败）。
3. **验证文件必须在 `public/` 里**（每次 `next build` 会清空 out/ 再复制 public/）：
   - `baidu_verify_*.html`（百度站长验证）
   - `google*.html`（Google 验证）
   - `ads.txt`（AdSense）
   - `baikecalc-7f3a9c2e.txt`（IndexNow 验证，内容就是 `baikecalc-7f3a9c2e`）
4. **SEO 组件已就位**（无需重复加）：
   - `src/components/layout/baidu-analytics.tsx`（百度统计）
   - `src/components/layout/hreflang-tags.tsx`（6 语言 hreflang）
   - `layout.tsx` 里已渲染这两个组件 + canonical

---

## 四、部署后验证（curl 即可）

```bash
# 首页 200
curl -s -o /dev/null -w "%{http_code}\n" https://baikecalc.com/zh/

# IndexNow 验证文件可达（必须 200 + text/plain）
curl -s -w "\n%{http_code}\n" https://baikecalc.com/baikecalc-7f3a9c2e.txt

# canonical 正确
curl -s https://baikecalc.com/zh/ | grep -o '<link rel="canonical"[^>]*>'

# www 应 301 到裸域
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://www.baikecalc.com/
```

> 注：本机 Windows 跑 curl 不需要 `HTTPS_PROXY= HTTP_PROXY=` 前缀（那是沙箱环境才需要的）。直接 `curl` 即可。

---

## 五、百度主动推送（可选，加速收录）

一键脚本：`C:\Users\admin\Desktop\kaifa\converty-site\push-baidu.bat`（双击即可，脚本内已内置 token，从线上 sitemap 抓 URL）。

- 百度 API 要求 `site` 参数为**裸域名** `baikecalc.com`（不能带 `https://`），否则返回 `site init fail`。
- 每日有配额，超了会 `over quota`，次日重置。
- 沙箱/代理环境连不上百度 API 的 443，本机直连正常。

---

## 六、常见问题速查

| 现象                              | 原因                             | 解决                                              |
| ------------------------------- | ------------------------------ | ----------------------------------------------- |
| build 报 `package-lock.json`     | turbopack.root 缺失              | 确认 next.config.ts 有 `turbopack.root: __dirname` |
| build 报找不到 `./routing`          | 存在错误 `navigation.tsx`          | 删除 `src/i18n/navigation.tsx`，保留 `navigation.ts` |
| 部署上去还是旧代码                       | 没传 out 参数，脚本默认目录已删除会报错 | 命令加第 2 参数 `converty-site/out`                   |
| 线上 `baikecalc-7f3a9c2e.txt` 404 | public 里没放该文件                  | 放进 `public/` 重新 build + 部署                      |
| `npm run build` 报 ERR_WORKER    | NODE_OPTIONS 注入                | 用 `NODE_OPTIONS= node .../next build`           |

