"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type Locale, locales } from "@/i18n/config";
import { usePathname } from "@/i18n/navigation";

const localeLabels: Record<Locale, string> = {
	en: "EN",
	es: "ES",
	de: "DE",
	ja: "JA",
	zh: "ZH",
	"zh-TW": "TW",
};

const localeFullLabels: Record<Locale, string> = {
	en: "English",
	es: "Español",
	de: "Deutsch",
	ja: "日本語",
	zh: "中文",
	"zh-TW": "繁體中文",
};

export function LanguageSwitcher() {
	const locale = useLocale() as Locale;
	const pathname = usePathname();
	const t = useTranslations("common");

	const handleLocaleChange = (newLocale: string) => {
		// Use a full page navigation for reliability across Next.js versions and
		// static export. `pathname` from next-intl excludes the locale prefix when
		// `localePrefix: "always"` is used, so we prepend the new locale.
		const newPath = `/${newLocale}${pathname === "/" ? "" : pathname}`;
		window.location.assign(
			newPath + window.location.search + window.location.hash,
		);
	};

	return (
		<Select value={locale} onValueChange={handleLocaleChange}>
			<SelectTrigger
				aria-label={t("selectLanguage")}
				className="h-9 w-[74px] rounded-lg border-border bg-card px-2 text-[12px] font-medium text-foreground transition hover:border-primary hover:bg-muted dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
			>
				<Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
				<SelectValue>{localeLabels[locale]}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{locales.map((loc) => (
					<SelectItem key={loc} value={loc}>
						{localeFullLabels[loc]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
