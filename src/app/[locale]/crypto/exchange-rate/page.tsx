import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const ExchangeRateCalculator = dynamic(
  () => import("./exchange-rate-calculator").then((mod) => mod.ExchangeRateCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.exchange-rate" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "crypto",
      "exchange",
      "rate",
      "bitcoin",
      "ethereum",
      "litecoin",
      "ripple",
      "dogecoin",
      "cardano",
      "chf",
      "eur",
      "usd",
      "convert",
      "price",
      "cryptocurrency",
      "btc",
      "eth",
      "ltc",
      "xrp",
      "doge",
      "ada",
    ],
  };
}

export default async function ExchangeRatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.exchange-rate");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("crypto")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("crypto.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <ExchangeRateCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
