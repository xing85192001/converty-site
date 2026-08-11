import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const VmwareLicensingCalculator = dynamic(
  () => import("./vmware-licensing-calculator").then((mod) => mod.VmwareLicensingCalculator),
  { loading: () => <CalculatorSkeleton inputCount={5} showResults /> }
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
    namespace: "converter.vmware-licensing-calculator",
  });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "vmware",
      "vcf",
      "vvf",
      "licensing",
      "subscription",
      "vsan",
      "cost",
      "pricing",
      "core-based",
      "cloud foundation",
      "vsphere",
    ],
  };
}

export default async function VmwareLicensingCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.vmware-licensing-calculator");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("infrastructure")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("infrastructure.name")}
    >
      <Suspense fallback={<CalculatorSkeleton inputCount={5} showResults />}>
        <VmwareLicensingCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
