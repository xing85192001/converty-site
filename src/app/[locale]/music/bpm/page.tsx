import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const BPMCalculator = dynamic(() => import("./bpm-calculator").then((mod) => mod.BPMCalculator), {
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
  const t = await getTranslations({ locale, namespace: "converter.bpm" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["bpm", "tempo", "beats per minute", "music", "delay", "note duration"],
  };
}

export default async function BPMPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.bpm");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("music")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("music.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <BPMCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
