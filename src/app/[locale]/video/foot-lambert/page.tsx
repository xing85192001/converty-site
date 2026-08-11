import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const FootLambertCalculator = dynamic(
  () => import("./foot-lambert-calculator").then((mod) => mod.FootLambertCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.foot-lambert" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["foot lambert", "luminance", "brightness", "cinema", "projection"],
  };
}

export default async function FootLambertPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.foot-lambert");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("video")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("video.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <FootLambertCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
