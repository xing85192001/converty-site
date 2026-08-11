import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { CalculatorInfo } from "@/components/converter/calculator-info";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const IncomeTaxComponent = dynamic(
  () => import("./income-tax-component").then((m) => m.IncomeTaxComponent),
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
  const t = await getTranslations({ locale, namespace: "converter.income-tax" });
  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["income tax", "tax calculator", "progressive tax", "brackets", "calculator"],
  };
}

export default async function IncomeTaxPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("converter.income-tax");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("finance")!;
  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("finance.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <IncomeTaxComponent />
      </Suspense>
      <CalculatorInfo
        intro="This tool estimates income tax using a simplified progressive (marginal bracket) model. It is for educational planning only and is not tax advice."
        sections={[
          {
            heading: "How progressive tax works",
            body: (
              <p>
                Income is taxed in layers. The first portion is taxed at the lowest rate, the next
                portion at the next rate, and so on. Only the amount that falls inside a bracket is
                taxed at that bracket&apos;s rate.
              </p>
            ),
          },
          {
            heading: "The formula",
            body: (
              <p>
                <code>tax = Σ over brackets (taxable income in bracket × bracket rate)</code>. The
                effective rate is total tax ÷ taxable income.
              </p>
            ),
          },
          {
            heading: "Example",
            body: (
              <p>
                With brackets 0–10k at 10% and 10k–40k at 20%, 30k of income yields 1,000 + 4,000 =
                5,000 in tax — an effective rate of about 16.7%.
              </p>
            ),
          },
          {
            heading: "Important",
            body: (
              <p>
                Real systems include deductions, credits, and regional rules. Consult a qualified
                professional before filing.
              </p>
            ),
          },
        ]}
      />
    </ConverterLayout>
  );
}
