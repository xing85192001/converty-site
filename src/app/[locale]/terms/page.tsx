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
  const tCommon = await getTranslations("common");
  const tUi = await getTranslations("ui");
  const t = await getTranslations("legal.terms");

  return (
    <LegalPage title={tUi("terms-of-service")} description={t("description")}>
      <p>{t("intro", { siteName: tCommon("siteName") })}</p>

      <LegalSection title={tUi("no-professional-advice")}>
        <p>{t("noProfessionalAdviceBody")}</p>
      </LegalSection>

      <LegalSection title={t("accuracy")}>
        <p>{t("accuracyBody")}</p>
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

      <LegalSection title={t("advertising")}>
        <p>{t("advertisingBody")}</p>
      </LegalSection>

      <LegalSection title={tUi("user-content")}>
        <p>
          <T k="ui.user-content-body" />
        </p>
      </LegalSection>

      <LegalSection title={t("changes")}>
        <p>{t("changesBody")}</p>
      </LegalSection>

      <p className="text-xs text-muted-foreground">
        <T k="ui.last-updated-august-11-2026" />
      </p>
    </LegalPage>
  );
}
