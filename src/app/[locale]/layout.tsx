import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LocaleHtmlLang } from "@/components/layout/locale-html-lang";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { type Locale, locales } from "@/i18n/config";
import { SWRegistration } from "./sw-registration";

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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SWRegistration />
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
