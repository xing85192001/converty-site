import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const MiningCalculator = dynamic(
  () => import("./mining-calculator").then((mod) => mod.MiningCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.mining-calculator" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "mining",
      "bitcoin",
      "profitability",
      "hashrate",
      "electricity",
      "roi",
      "asic",
      "crypto",
      "btc",
      "miner",
      "profit",
      "calculator",
      "antminer",
      "whatsminer",
      "s19",
      "m30s",
    ],
  };
}

export default async function MiningCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.mining-calculator");
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
        <MiningCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
