import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const DoFTableCalculator = dynamic(
  () => import("./dof-table-calculator").then((mod) => mod.DoFTableCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.dof-table" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["depth of field", "table", "dof", "aperture", "reference"],
  };
}

export default async function DOFTablePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.dof-table");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("photo")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("photo.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <DoFTableCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
