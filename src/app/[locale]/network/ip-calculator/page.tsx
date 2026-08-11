import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const IPCalculator = dynamic(() => import("./ip-calculator").then((mod) => mod.IPCalculator), {
  loading: () => <CalculatorSkeleton />,
});

/**
 * Generate static params for all locales
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Generate metadata for IP calculator page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "converter.ip-calculator" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "IP address",
      "IP class",
      "IPv4",
      "IPv6",
      "public IP",
      "private IP",
      "RFC 1918",
      "IP classification",
      "network",
    ],
  };
}

/**
 * IP calculator page
 */
export default async function IPCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.ip-calculator");
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
        <IPCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
