import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const DataSizeConverter = dynamic(
  () => import("./data-size-converter").then((mod) => mod.DataSizeConverter),
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
  const t = await getTranslations({ locale, namespace: "converter.data-size" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["data size", "converter", "bytes", "kb", "mb", "gb", "tb"],
  };
}

export default async function DataSizePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.data-size");
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
        <DataSizeConverter />
      </Suspense>
    </ConverterLayout>
  );
}
