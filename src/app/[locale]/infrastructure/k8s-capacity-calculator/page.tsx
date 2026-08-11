import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const K8sCapacityCalculator = dynamic(
  () => import("./k8s-capacity-calculator").then((mod) => mod.K8sCapacityCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.k8s-capacity-calculator" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "kubernetes",
      "k8s",
      "capacity planning",
      "node sizing",
      "cluster",
      "pods",
      "resources",
      "cpu",
      "memory",
    ],
  };
}

export default async function K8sCapacityCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.k8s-capacity-calculator");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("infrastructure")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("infrastructure.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <K8sCapacityCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
