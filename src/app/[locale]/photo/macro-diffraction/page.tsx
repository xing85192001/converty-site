import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const MacroDiffractionCalculator = dynamic(
  () => import("./macro-diffraction-calculator").then((mod) => mod.MacroDiffractionCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.macro-diffraction" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["macro", "diffraction", "aperture", "sharpness", "close-up"],
  };
}

export default async function MacroDiffractionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.macro-diffraction");
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
        <MacroDiffractionCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
