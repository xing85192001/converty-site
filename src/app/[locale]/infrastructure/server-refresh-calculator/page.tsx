import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const ServerRefreshCalculator = dynamic(
  () => import("./server-refresh-calculator").then((mod) => mod.ServerRefreshCalculator),
  { loading: () => <CalculatorSkeleton inputCount={8} showResults /> }
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
  const t = await getTranslations({
    locale,
    namespace: "converter.server-refresh-calculator",
  });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "server refresh",
      "fleet migration",
      "cpu upgrade",
      "specint",
      "headroom",
      "power budget",
      "rack density",
      "server count",
      "datacenter refresh",
    ],
  };
}

export default async function ServerRefreshCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.server-refresh-calculator");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("infrastructure")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("infrastructure.name")}
    >
      <Suspense fallback={<CalculatorSkeleton inputCount={8} showResults />}>
        <ServerRefreshCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
