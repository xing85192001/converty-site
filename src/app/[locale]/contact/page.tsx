import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <LegalPage
      title="Contact Us"
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
            href="mailto:hello@allcalc.cc.cd"
          >
            hello@allcalc.cc.cd
          </a>
        </p>
        <p>
          Privacy questions:{" "}
          <a
            className="text-primary underline underline-offset-4"
            href="mailto:privacy@allcalc.cc.cd"
          >
            privacy@allcalc.cc.cd
          </a>
        </p>
      </LegalSection>

      <LegalSection title="What to include">
        <ul className="list-disc space-y-1 pl-5">
          <li>For a bug or wrong result, tell us which calculator and the inputs you used.</li>
          <li>For a new tool suggestion, describe the calculation you need.</li>
          <li>For business or advertising, include your website and a short note.</li>
        </ul>
      </LegalSection>

      <p className="text-xs text-muted-foreground">Last updated: August 11, 2026.</p>
    </LegalPage>
  );
}
