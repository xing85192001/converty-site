import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const DateCalculator = dynamic(
  () => import("./date-calculator").then((mod) => mod.DateCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.date" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["date", "calculator", "add", "subtract", "days", "weeks", "months"],
  };
}

export default async function DatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.date");
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
        <DateCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
