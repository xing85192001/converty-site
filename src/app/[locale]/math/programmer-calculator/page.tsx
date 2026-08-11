import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const ProgrammerCalculatorComponent = dynamic(
  () => import("./programmer-calculator-component").then((m) => m.ProgrammerCalculatorComponent),
  { loading: () => <CalculatorSkeleton /> }
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
  const t = await getTranslations({ locale, namespace: "converter.programmer-calculator" });
  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["programmer calculator", "base converter", "hex", "binary", "bitwise", "calculator"],
  };
}

export default async function ProgrammerCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("converter.programmer-calculator");
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
        <ProgrammerCalculatorComponent />
      </Suspense>
    </ConverterLayout>
  );
}
