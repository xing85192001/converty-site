import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const SpeedConverter = dynamic(
  () => import("./speed-converter").then((mod) => mod.SpeedConverter),
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
  const t = await getTranslations({ locale, namespace: "converter.speed" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["speed", "velocity", "converter", "mph", "km/h", "m/s", "knots", "mach"],
  };
}

export default async function SpeedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.speed");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("physics")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("physics.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <SpeedConverter />
      </Suspense>
    </ConverterLayout>
  );
}
