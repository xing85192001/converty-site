import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const SurfaceAreaCalculator = dynamic(
  () => import("./surface-area-calculator").then((mod) => mod.SurfaceAreaCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.surface-area-calculator" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["surface area", "geometry", "3D shapes", "cube", "sphere", "cylinder", "calculator"],
  };
}

export default async function SurfaceAreaCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.surface-area-calculator");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("math")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("math.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <SurfaceAreaCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
