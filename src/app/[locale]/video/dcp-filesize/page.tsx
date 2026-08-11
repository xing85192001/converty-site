import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const DCPFilesizeCalculator = dynamic(
  () => import("./dcp-filesize-calculator").then((mod) => mod.DCPFilesizeCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.dcp-filesize" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["dcp", "digital cinema package", "file size", "cinema"],
  };
}

export default async function DCPFilesizePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.dcp-filesize");
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
        <DCPFilesizeCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
