import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const RgbConverter = dynamic(() => import("./rgb-converter").then((mod) => mod.RgbConverter), {
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
  const t = await getTranslations({
    locale,
    namespace: "converter.rgb",
  });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["rgb converter", "hex to rgb", "color converter", "hsl converter", "cmyk converter"],
  };
}

export default async function RgbConverterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.rgb");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("color")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("color.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <RgbConverter />
      </Suspense>
    </ConverterLayout>
  );
}
