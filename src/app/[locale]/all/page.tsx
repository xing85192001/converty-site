import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AllToolsBrowser } from "@/components/all-tools-browser";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: t("allTools"),
    description: t("tagline"),
  };
}

export default async function AllToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("common");

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">{t("allTools")}</h1>
        <p className="text-muted-foreground">{t("tagline")}</p>
      </div>

      <AllToolsBrowser />
    </div>
  );
}
