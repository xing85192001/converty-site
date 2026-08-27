import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const SITE = siteConfig.siteUrl.replace(/\/$/, "");
  return {
    rules: [
      // 全放行兜底（老爬虫不认通配符时按下面具名规则处理）
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      // 国内主流搜索引擎
      { userAgent: "Baiduspider", allow: "/" },
      { userAgent: "Baiduspider-render", allow: "/" },
      { userAgent: "Sogou web spider", allow: "/" },
      { userAgent: "360Spider", allow: "/" },
      { userAgent: "YisouSpider", allow: "/" }, // 神马/UC 移动端
      { userAgent: "YoudaoBot", allow: "/" },
      // 国际搜索引擎
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Googlebot-Image", allow: "/" },
      { userAgent: "Bingbot", allow: "/" }, // 同时覆盖 Edge / Windows 搜索
      { userAgent: "MSNBot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "Yahoo! Slurp", allow: "/" },
      { userAgent: "YandexBot", allow: "/" },
      // AI / 摘要爬虫（2026 建议放行，便于被 AI 搜索引用）
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Gemini", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" }, // 字节跳动（豆包/扣子）
      { userAgent: "TSpider", allow: "/" }, // 腾讯（元宝/搜狗搜索）
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" }, // Meta AI
      { userAgent: "GrokBot", allow: "/" }, // xAI Grok
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
