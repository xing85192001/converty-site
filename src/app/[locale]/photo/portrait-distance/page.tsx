import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const PortraitDistanceCalculator = dynamic(
  () => import("./portrait-distance-calculator").then((mod) => mod.PortraitDistanceCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.portrait-distance" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["portrait", "distance", "focal length", "framing", "photography"],
  };
}

export default async function PortraitDistancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.portrait-distance");
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
        <PortraitDistanceCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
