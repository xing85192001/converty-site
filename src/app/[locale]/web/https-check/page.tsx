import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const HTTPSChecker = dynamic(() => import("./https-checker").then((mod) => mod.HTTPSChecker), {
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
  const t = await getTranslations({ locale, namespace: "converter.https-check" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["https", "ssl", "tls", "certificate", "security"],
  };
}

export default async function HTTPSCheckPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.https-check");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("web")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("web.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <HTTPSChecker />
      </Suspense>
    </ConverterLayout>
  );
}
