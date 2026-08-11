import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const ThroughputCalculator = dynamic(
  () => import("./throughput-calculator").then((mod) => mod.ThroughputCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.throughput-calculator" });
  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "throughput",
      "network speed",
      "bandwidth",
      "transfer rate",
      "Mbps",
      "Gbps",
      "network performance",
    ],
  };
}

export default async function ThroughputCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.throughput-calculator");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("network")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("network.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <ThroughputCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
