import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LocaleHtmlLang } from "@/components/layout/locale-html-lang";
import { HreflangTags } from "@/components/layout/hreflang-tags";
import { BaiduAnalytics } from "@/components/layout/baidu-analytics";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { type Locale, locales } from "@/i18n/config";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common.metadata" });
  const common = await getTranslations({ locale, namespace: "common" });

  return {
    title: {
      default: `${common("siteName")} - ${common("tagline")}`,
      template: `%s | ${t("titleSuffix")}`,
    },
    description: t("defaultDescription"),
    keywords: [
      "calculator",
      "converter",
      "tools",
      "online",
      "free",
      "color",
      "data",
      "finance",
      "health",
      "music",
      "photo",
      "physics",
      "video",
      "web",
    ],
    // Canonical + metadataBase: tells search engines the bare domain is the
    // canonical host. Without this, www + bare both serve identical content and
    // Google reports "duplicate, no canonical specified".
    metadataBase: new URL(siteConfig.siteUrl),
    alternates: {
      canonical: "./",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for client components
  const messages = await getMessages();

  return (
      <NextIntlClientProvider messages={messages}>
      <LocaleHtmlLang />
      <HreflangTags />
      <BaiduAnalytics />
      {/* 百度自动推送：用户/蜘蛛访问页面时向百度上报当前 URL（被动补漏，首次收录仍需在百度资源平台验证+提交 sitemap） */}
      <Script
        id="baidu-push"
        strategy="afterInteractive"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: 百度官方自动推送脚本，必须内联动态注入
        dangerouslySetInnerHTML={{
          __html: `(function(){var bp=document.createElement('script');var curProtocol=window.location.protocol.split(':')[0];if(curProtocol==='https'){bp.src='https://zz.bdstatic.com/linksubmit/push.js';}else{bp.src='http://push.zhanzhang.baidu.com/push.js';}var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(bp,s);})();`,
        }}
      />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
        </div>
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
