import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { T } from "@/components/ui/t";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tUi = await getTranslations("ui");
  return (
    <LegalPage
      title={tUi("contact-us")}
      description="Questions, corrections, or partnership ideas? Reach out any time."
    >
      <p>
        We read every message and try to reply within a few business days. The fastest way to reach
        us is email.
      </p>

      <LegalSection title="Email">
        <p>
          General &amp; support:{" "}
          <a
            className="text-primary underline underline-offset-4"
            href="mailto:xingxing85192001@gmail.com"
          >
            xingxing85192001@gmail.com
          </a>
        </p>
        <p>
          Privacy questions:{" "}
          <a className="text-primary underline underline-offset-4" href="mailto:85192001@qq.com">
            85192001@qq.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title={tUi("what-to-include")}>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <T k="ui.for-a-bug-or-wrong-result-tell-us-which-calculator-and-the-inputs-you-used" />
          </li>
          <li>
            <T k="ui.for-a-new-tool-suggestion-describe-the-calculation-you-need" />
          </li>
          <li>
            <T k="ui.for-business-or-advertising-include-your-website-and-a-short-note" />
          </li>
        </ul>
      </LegalSection>

      <p className="text-xs text-muted-foreground">
        <T k="ui.last-updated-august-11-2026" />
      </p>
    </LegalPage>
  );
}
