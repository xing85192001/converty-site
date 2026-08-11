import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <LegalPage
      title="Privacy Policy"
      description="How we handle information when you use our free online calculators."
    >
      <p>
        This Privacy Policy explains what information is collected when you visit {t("siteName")}{" "}
        and how it is used. This site is a static web application: it does not require you to create
        an account and does not ask you to submit personal information to use any calculator.
      </p>

      <LegalSection title="Information collected automatically">
        <p>
          When you visit the site, our hosting provider (Vercel) and, if enabled, analytics and
          advertising partners automatically receive standard technical information such as your IP
          address, browser type, device type, language preference, referring pages, and the date and
          time of your visit. This information is used only to operate, secure, and improve the
          site.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and advertising">
        <p>
          We use cookies and similar technologies to remember your preferences and to serve
          personalized advertisements through Google AdSense. Advertisers may use cookies to build a
          profile of your interests based on your activity across websites. You can control
          non-essential cookies through the consent banner shown when you first visit the site, and
          you can change your choice at any time by clearing this site&apos;s storage.
        </p>
        <p>
          To learn more about how Google uses data when you use our partners&apos; sites and apps,
          visit{" "}
          <a
            className="text-primary underline underline-offset-4"
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s Advertising Policies
          </a>
          . You can manage personalization at{" "}
          <a
            className="text-primary underline underline-offset-4"
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ads Settings
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="How we use information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To operate and secure the site.</li>
          <li>To understand which tools are useful so we can improve them.</li>
          <li>To display advertisements that help keep the calculators free.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on where you live (for example under the EU GDPR or the California CCPA), you
          may have the right to access, correct, or delete personal data and to object to certain
          processing. Because this site does not store personal data on its own servers, most
          requests relate to data held by our service providers, which we will help you address on
          request.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          If you have any questions about this policy, contact us at{" "}
          <a className="text-primary underline underline-offset-4" href="mailto:85192001@qq.com">
            85192001@qq.com
          </a>
          .
        </p>
      </LegalSection>

      <p className="text-xs text-muted-foreground">Last updated: August 11, 2026.</p>
    </LegalPage>
  );
}
