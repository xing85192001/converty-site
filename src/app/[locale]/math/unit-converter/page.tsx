import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { CalculatorInfo } from "@/components/converter/calculator-info";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const UnitConverterComponent = dynamic(
  () => import("./unit-converter-component").then((m) => m.UnitConverterComponent),
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
  const t = await getTranslations({ locale, namespace: "converter.unit-converter" });
  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["unit converter", "conversion", "length", "mass", "temperature", "calculator"],
  };
}

export default async function UnitConverterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("converter.unit-converter");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("math")!;
  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      categoryId={category.id}
      categoryName={tc("math.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <UnitConverterComponent />
      </Suspense>
      <CalculatorInfo
        intro="Convert a value from one unit to another across length, mass, temperature, and more. Type a value in any field and the others update instantly."
        sections={[
          {
            heading: "How linear conversion works",
            body: (
              <p>
                Most units scale by a fixed factor: <code>value × factor = result</code>. For
                example, meters to feet uses the factor 3.28084.
              </p>
            ),
          },
          {
            heading: "Temperature is special",
            body: (
              <p>
                Celsius, Fahrenheit, and Kelvin do not share a zero point, so they use offset
                formulas rather than a simple factor. For example, °F = °C × 9/5 + 32.
              </p>
            ),
          },
          {
            heading: "Tips",
            body: (
              <p>
                Pick the right category first, then choose the from/to units. Results keep several
                decimal places so you can round as needed.
              </p>
            ),
          },
        ]}
      />
    </ConverterLayout>
  );
}
