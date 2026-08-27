import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { CalculatorInfo } from "@/components/converter/calculator-info";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { T } from "@/components/ui/t";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const SetCalculatorComponent = dynamic(
  () => import("./set-calculator-component").then((m) => m.SetCalculatorComponent),
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
  const t = await getTranslations({ locale, namespace: "converter.set-calculator" });
  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["set calculator", "union", "intersection", "set theory", "calculator"],
  };
}

export default async function SetCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("converter.set-calculator");
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
        <SetCalculatorComponent />
      </Suspense>
      <CalculatorInfo
        intro="Operate on two sets entered as comma-separated values. The tool returns union, intersection, difference, and symmetric difference, plus set membership checks."
        sections={[
          {
            heading: "Set operations",
            body: (
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Union (A ∪ B)</strong> — everything in A or B.
                </li>
                <li>
                  <strong>Intersection (A ∩ B)</strong> — only items in both A and B.
                </li>
                <li>
                  <strong>Difference (A − B)</strong> — items in A but not in B.
                </li>
                <li>
                  <strong>
                    <T k="ui.symmetric-difference" />
                  </strong>{" "}
                  — items in either set but not both.
                </li>
              </ul>
            ),
          },
          {
            heading: "How to enter sets",
            body: (
              <p>
                Type values separated by commas, e.g. <code>1, 2, 3</code>. Duplicates are removed
                automatically because a set holds each element at most once.
              </p>
            ),
          },
          {
            heading: "Where this is used",
            body: (
              <p>
                Set logic underpins database queries, probability, logic design, and data
                de-duplication.
              </p>
            ),
          },
        ]}
      />
    </ConverterLayout>
  );
}
