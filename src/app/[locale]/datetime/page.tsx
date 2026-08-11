import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SubcategoryNav } from "@/components/converter/subcategory-nav";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav.datetime" });

  return {
    title: t("name"),
    description: t("description"),
  };
}

export default async function DateTimePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("nav.datetime");

  const category = getCategoryBySlug("datetime");
  const Icon = category?.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          <h1 className="text-3xl font-bold">{t("name")}</h1>
        </div>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <SubcategoryNav categoryId="datetime" categorySlug="datetime" />
    </div>
  );
}
