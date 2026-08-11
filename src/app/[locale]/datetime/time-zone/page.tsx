import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const TimeZoneCalculator = dynamic(
  () => import("./time-zone-calculator").then((mod) => mod.TimeZoneCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.time-zone" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["time zone", "converter", "utc", "gmt", "world clock"],
  };
}

export default async function TimeZonePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.time-zone");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("datetime")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("datetime.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <TimeZoneCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
