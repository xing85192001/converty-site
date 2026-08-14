import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { T } from "@/components/ui/t";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  const tUi = await getTranslations("ui");
  return (
    <LegalPage
      title={tUi("terms-of-service")}
      description="The rules for using our free calculators and converters."
    >
      <p>
        By using {t("siteName")} you agree to the terms below. These tools are provided free of
        charge for general informational purposes.
      </p>

      <LegalSection title={tUi("no-professional-advice")}>
        <p>
          Calculators on this site are educational and informational. They are not a substitute for
          professional financial, medical, legal, or engineering advice. Always verify important
          results independently and consult a qualified professional where it matters.
        </p>
      </LegalSection>

      <LegalSection title="Accuracy">
        <p>
          We work to keep every tool accurate, but we make no warranty that results are complete,
          correct, or suitable for your specific situation. Use the tools at your own risk.
        </p>
      </LegalSection>

      <LegalSection title={tUi("acceptable-use")}>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <T k="ui.do-not-misuse-disrupt-or-attempt-to-overload-the-service" />
          </li>
          <li>
            <T k="ui.do-not-use-the-site-for-any-unlawful-purpose" />
          </li>
          <li>
            <T k="ui.respect-the-intellectual-property-behind-the-software-and-content" />
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Advertising">
        <p>
          The site displays third-party advertisements (including Google AdSense). Advertisers are
          responsible for their own content, and their use of your data is governed by their privacy
          policies.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms from time to time. Continued use of the site after changes
          constitutes acceptance of the updated terms.
        </p>
      </LegalSection>

      <p className="text-xs text-muted-foreground">
        <T k="ui.last-updated-august-11-2026" />
      </p>
    </LegalPage>
  );
}
