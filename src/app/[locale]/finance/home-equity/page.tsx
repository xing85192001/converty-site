import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const HomeEquityCalculator = dynamic(
  () => import("./home-equity-calculator").then((mod) => mod.HomeEquityCalculator),
  {
    loading: () => <CalculatorSkeleton />,
  }
);

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "converter.home-equity" });
  return {
    title: t("name"),
    description: t("metaDescription"),
  };
}

export default async function HomeEquityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "converter.home-equity" });
  const tc = await getTranslations({ locale, namespace: "nav" });
  const category = getCategoryBySlug("finance")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("finance.name")}
    >
      <HomeEquityCalculator />
    </ConverterLayout>
  );
}
