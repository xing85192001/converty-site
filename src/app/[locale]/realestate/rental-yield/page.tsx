import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const RentalYieldCalculator = dynamic(
  () => import("./rental-yield-calculator").then((mod) => mod.RentalYieldCalculator),
  {
    loading: () => <CalculatorSkeleton />,
  }
);

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "converter.rental-yield" });

  return {
    title: `Free Online ${t("name")}`,
    description: t("metaDescription"),
  };
}

export default async function RentalYieldPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "converter.rental-yield" });
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("realestate")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      categoryId={category.id}
      categoryName={tc("realestate.name")}
      toolId="rental-yield"
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <RentalYieldCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
