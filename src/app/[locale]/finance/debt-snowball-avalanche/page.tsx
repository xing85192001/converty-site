import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const DebtSnowballAvalancheComponent = dynamic(
  () => import("./debt-snowball-avalanche-component").then((m) => m.DebtSnowballAvalancheComponent),
  { loading: () => <CalculatorSkeleton /> }
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
  const t = await getTranslations({ locale, namespace: "converter.debt-snowball-avalanche" });
  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["debt payoff", "snowball", "avalanche", "debt calculator", "payoff plan"],
  };
}

export default async function DebtSnowballAvalanchePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("converter.debt-snowball-avalanche");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("finance")!;
  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("finance.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <DebtSnowballAvalancheComponent />
      </Suspense>
    </ConverterLayout>
  );
}
