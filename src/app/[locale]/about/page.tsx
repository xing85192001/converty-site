import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { T } from "@/components/ui/t";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function AboutPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("common");

	const tUi = await getTranslations("ui");
	return (
		<LegalPage
			title={tUi("about-us")}
			description={tUi("about-intro", { siteName: t("siteName") })}
		>
			<p>{tUi("about-intro", { siteName: t("siteName") })}</p>

			<LegalSection title={tUi("what-we-offer")}>
				<ul className="list-disc space-y-1 pl-5">
					<li>{tUi("about-offer-finance")}</li>
					<li>{tUi("about-offer-health")}</li>
					<li>{tUi("about-offer-education")}</li>
					<li>{tUi("about-offer-technology")}</li>
				</ul>
			</LegalSection>

			<LegalSection title={tUi("how-it-works")}>
				<p>{tUi("about-how-it-works")}</p>
			</LegalSection>

			<LegalSection title={tUi("editorial-standards")}>
				<p>{tUi("about-editorial")}</p>
			</LegalSection>

			<p className="text-xs text-muted-foreground">
				<T k="ui.last-updated-august-11-2026" />
			</p>
		</LegalPage>
	);
}
