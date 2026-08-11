import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const BandwidthDelayProductCalculator = dynamic(
  () =>
    import("./bandwidth-delay-product-calculator").then(
      (mod) => mod.BandwidthDelayProductCalculator
    ),
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
  const t = await getTranslations({ locale, namespace: "converter.bandwidth-delay-product" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["bandwidth", "delay", "product", "bdp", "tcp", "buffer", "window size", "network"],
  };
}

export default async function BandwidthDelayProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.bandwidth-delay-product");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("data")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("data.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <BandwidthDelayProductCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
