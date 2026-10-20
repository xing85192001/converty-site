import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function EditorialPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const tUi = await getTranslations("ui");

	return (
		<LegalPage title={tUi("editorial-standards")} description={tUi("editorialTeamBio")}>
			<LegalSection title={tUi("about-us")}>
				<p>{tUi("about-intro")}</p>
			</LegalSection>

			<LegalSection title={tUi("how-it-works")}>
				<p>{tUi("about-how-it-works")}</p>
			</LegalSection>

			<LegalSection title={tUi("editorial-standards")}>
				<p>{tUi("about-editorial")}</p>
				<p className="mt-3 text-sm text-muted-foreground">
					{tUi("editorialReviewNote")}
				</p>
			</LegalSection>

			<LegalSection title={tUi("editorialAuthorRole")}>
				<p>
					{tUi("editorialAuthorName")} — {tUi("editorialAuthorRole")}
				</p>
			</LegalSection>
		</LegalPage>
	);
}
