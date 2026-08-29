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

const DebtSnowballAvalancheComponent = dynamic(
  () => import("./debt-snowball-avalanche-component").then((m) => m.DebtSnowballAvalancheComponent),
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
  const t = await getTranslations({ locale, namespace: "converter.debt-snowball-avalanche" });
  return {
    title: `Free Online ${t("name")}`,
    description: t("metaDescription"),
    keywords: ["debt payoff", "snowball", "avalanche", "debt calculator", "payoff plan"],
  };
}

export default async function DebtSnowballAvalanchePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("converter.debt-snowball-avalanche");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("finance")!;
  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      categoryId={category.id}
      categoryName={tc("finance.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <DebtSnowballAvalancheComponent />
      </Suspense>
      <CalculatorInfo
        intro="Two popular strategies for paying off multiple debts faster. Both throw every spare dollar at debt, but they differ in which debt goes first."
        sections={[
          {
            heading: "Snowball method",
            body: (
              <p>
                Pay the minimum on everything, then put extra money toward the{" "}
                <strong>
                  <T k="ui.smallest-balance" />
                </strong>{" "}
                first. You win quick psychological wins as balances disappear.
              </p>
            ),
          },
          {
            heading: "Avalanche method",
            body: (
              <p>
                Pay the minimum on everything, then put extra money toward the{" "}
                <strong>
                  <T k="ui.highest-interest-rate" />
                </strong>{" "}
                first. This minimizes total interest paid and is usually the cheaper path
                mathematically.
              </p>
            ),
          },
          {
            heading: "How the payoff is computed",
            body: (
              <p>
                Each month, interest accrues on every balance, then your payment covers interest
                plus principal. Any leftover after minimums is applied to the target debt until it
                is zero, and the freed-up payment rolls into the next debt.
              </p>
            ),
          },
          {
            heading: "Tip",
            body: (
              <p>
                Use the results to compare total interest and months saved between the two methods
                for your exact debts.
              </p>
            ),
          },
        ]}
      />
    </ConverterLayout>
  );
}
