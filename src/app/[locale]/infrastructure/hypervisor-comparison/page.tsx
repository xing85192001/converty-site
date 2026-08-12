import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HypervisorComparisonCalculator } from "./hypervisor-comparison-calculator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "converter" });

  return {
    title: t("hypervisor-comparison.name"),
    description: t("hypervisor-comparison.description"),
  };
}

export default function HypervisorComparisonPage() {
  return <HypervisorComparisonCalculator />;
}
