import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { CalculatorInfo } from "@/components/converter/calculator-info";
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
      categoryId={category.id}
      categoryName={tc("math.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <ProgrammerCalculatorComponent />
      </Suspense>
      <CalculatorInfo
        intro="Convert integers between binary, octal, decimal, and hexadecimal, and apply bitwise operations. Type in any base and the others update live."
        sections={[
          {
            heading: "Number bases",
            body: (
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Binary (base 2)</strong> — digits 0–1, used by computers.
                </li>
                <li>
                  <strong>Octal (base 8)</strong> — digits 0–7.
                </li>
                <li>
                  <strong>Decimal (base 10)</strong> — everyday numbers.
                </li>
                <li>
                  <strong>Hexadecimal (base 16)</strong> — digits 0–9 and A–F, common in
                  programming.
                </li>
              </ul>
            ),
          },
          {
            heading: "Bitwise operations",
            body: (
              <p>
                AND, OR, XOR, and NOT compare bits position by position; shifts (≪, ≫) move bits
                left or right, which multiplies or divides by powers of two.
              </p>
            ),
          },
          {
            heading: "Signed numbers",
            body: (
              <p>
                Negative values use two&apos;s complement, where the highest bit indicates the sign.
                Toggle the signed mode to see how the same bits represent a negative number.
              </p>
            ),
          },
        ]}
      />
    </ConverterLayout>
  );
}
