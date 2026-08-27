import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { locales } from "@/i18n/config";

const RentalYieldCalculator = dynamic(
  () => import("./rental-yield-calculator").then((mod) => mod.RentalYieldCalculator),
  {
    loading: () => <CalculatorSkeleton />,
  }
);

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "converter.rental-yield" });

  return {
    title: t("name"),
    description: t("metaDescription"),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <RentalYieldCalculator />;
}
