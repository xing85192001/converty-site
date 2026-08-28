import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { T } from "@/components/ui/t";
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
	const tCommon = await getTranslations("common");
	const tUi = await getTranslations("ui");
	const t = await getTranslations("legal.privacy");

	return (
		<LegalPage title={tUi("privacy-policy")} description={t("description")}>
			<p>{t("intro", { siteName: tCommon("siteName") })}</p>

			<LegalSection title={tUi("information-collected-automatically")}>
				<p>{t("infoCollectedBody")}</p>
			</LegalSection>

			<LegalSection title={tUi("cookies-and-advertising")}>
				<p>{t("cookiesBody")}</p>
				<p>
					{t.rich("cookiesThirdParty", {
						link3: () => (
							<a
								className="text-primary underline underline-offset-4"
								href="https://adssettings.google.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								{t("cookiesAdsSettings")}
							</a>
						),
					})}
				</p>
				<p>
					{t.rich("cookiesGoogle", {
						link1: (chunks) => (
							<a
								className="text-primary underline underline-offset-4"
								href="https://policies.google.com/technologies/ads"
								target="_blank"
								rel="noopener noreferrer"
							>
								{chunks}
							</a>
						),
						link2: (chunks) => (
							<a
								className="text-primary underline underline-offset-4"
								href="https://adssettings.google.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								{chunks}
							</a>
						),
					})}
				</p>
			</LegalSection>

			<LegalSection title={tUi("how-we-use-information")}>
				<ul className="list-disc space-y-1 pl-5">
					<li>
						<T k="ui.to-operate-and-secure-the-site" />
					</li>
					<li>
						<T k="ui.to-understand-which-tools-are-useful-so-we-can-improve-them" />
					</li>
					<li>
						<T k="ui.to-display-advertisements-that-help-keep-the-calculators-free" />
					</li>
				</ul>
			</LegalSection>

			<LegalSection title={tUi("your-rights")}>
				<p>{t("yourRightsBody")}</p>
			</LegalSection>

			<LegalSection title={tUi("contact-us")}>
				<p>
					{t.rich("contactBody", {
						email: (chunks) => (
							<a
								className="text-primary underline underline-offset-4"
								href="mailto:contact@baikecalc.com"
							>
								{chunks}
							</a>
						),
					})}
				</p>
			</LegalSection>

			<p className="text-xs text-muted-foreground">
				<T k="ui.last-updated-august-28-2026" />
			</p>
		</LegalPage>
	);
}
