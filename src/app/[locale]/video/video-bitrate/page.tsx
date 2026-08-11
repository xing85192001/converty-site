import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const VideoBitrateCalculator = dynamic(
  () => import("./video-bitrate-calculator").then((mod) => mod.VideoBitrateCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.video-bitrate" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["bitrate", "video", "resolution", "fps", "codec", "h264", "h265"],
  };
}

export default async function VideoBitratePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.video-bitrate");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("video")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("video.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <VideoBitrateCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
