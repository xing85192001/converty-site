import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { T } from "@/components/ui/t";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  const tUi = await getTranslations("ui");
  return (
    <LegalPage
      title={tUi("about-us")}
      description="Why we built a free, fast, and privacy-friendly hub of calculators."
    >
      <p>
        {t("siteName")} is a collection of free online calculators and converters covering finance,
        health, education, and technology. Our goal is simple: give people accurate, instant tools
        without paywalls, sign-ups, or clutter.
      </p>

      <LegalSection title={tUi("what-we-offer")}>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Finance</strong> — loans, compound interest, debt payoff planning, and taxes.
          </li>
          <li>
            <strong>Health</strong> — BMI, BMR/TDEE, and body-fat estimates.
          </li>
          <li>
            <strong>Education</strong> — unit conversion, set operations, and a scientific
            calculator.
          </li>
          <li>
            <strong>Technology</strong> — programmer/base conversion and networking tools.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title={tUi("how-it-works")}>
        <p>
          Every calculation runs entirely in your browser. Results are computed on your device,
          which means your inputs stay private and the tools work instantly even on slow
          connections. The site is built as a fast, static web application so pages load quickly
          anywhere in the world.
        </p>
      </LegalSection>

      <LegalSection title={tUi("editorial-standards")}>
        <p>
          We aim for correctness and clarity. Formulas are documented on each tool, and we review
          the math behind every calculator. If you spot an error or have a suggestion, we would love
          to hear from you on the contact page.
        </p>
      </LegalSection>

      <p className="text-xs text-muted-foreground">
        <T k="ui.last-updated-august-11-2026" />
      </p>
    </LegalPage>
  );
}
