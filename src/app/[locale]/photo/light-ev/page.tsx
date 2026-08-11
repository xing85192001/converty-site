import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const LightEVCalculator = dynamic(
  () => import("./light-ev-calculator").then((mod) => mod.LightEVCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.light-ev" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["ev", "exposure value", "light", "photography", "metering"],
  };
}

export default async function LightEVPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.light-ev");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("photo")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("photo.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <LightEVCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
