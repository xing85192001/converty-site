import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const PipeFlowCalculator = dynamic(() => import("./pipe-flow-calculator"), {
  loading: () => <CalculatorSkeleton />,
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "converter.pipe-flow" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "pipe flow",
      "pressure drop",
      "Darcy-Weisbach",
      "friction factor",
      "Reynolds number",
      "Colebrook-White",
      "head loss",
      "hydraulics",
    ],
  };
}

export default async function PipeFlowPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.pipe-flow");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("engineering")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("engineering.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <PipeFlowCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
