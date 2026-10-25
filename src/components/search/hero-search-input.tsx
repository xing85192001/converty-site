"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useDeferredValue, useEffect, useState } from "react";
import type { SearchDocument } from "@/lib/search/search-data";

/**
 * Inline hero search box for the homepage. Reuses the build-time search index
 * (`/search/index-{locale}.json`) and fuse.js, both loaded lazily on first
 * interaction so neither enters the first-screen bundle. Live results, full
 * keyboard support (↑/↓/Enter/Esc) and a friendly empty state.
 */
export function HeroSearchInput() {
	const t = useTranslations("common.search");
	const locale = useLocale();
	const router = useRouter();

	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [results, setResults] = useState<SearchDocument[]>([]);
	const [active, setActive] = useState(0);
	const deferred = useDeferredValue(query);

	useEffect(() => {
		let cancelled = false;
		const q = deferred.trim();
		if (!q) {
			setResults([]);
			return;
		}
		(async () => {
			try {
				const mod = await import("@/lib/search/search-index");
				const fuse = await mod.getSearchInstance(locale);
				if (cancelled) return;
				setResults(mod.search(q, fuse));
				setActive(0);
			} catch {
				if (!cancelled) setResults([]);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [locale, deferred]);

	const go = (doc: SearchDocument) => {
		router.push(`/${locale}${doc.href}`);
		setOpen(false);
		setQuery("");
	};

	// Blue submit button: jump to the top hit, or browse all tools.
	const submit = () => {
		if (results.length > 0) {
			go(results[active] ?? results[0]);
			return;
		}
		setOpen(false);
		router.push(`/${locale}/all`);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((a) => Math.min(a + 1, results.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((a) => Math.max(a - 1, 0));
		} else if (e.key === "Enter" && results[active]) {
			e.preventDefault();
			go(results[active]);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	const showDropdown = open && deferred.trim().length > 0;

	return (
		<div className="relative mx-auto w-full max-w-xl">
			<div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-md transition-colors focus-within:border-primary">
				<Search className="h-5 w-5 shrink-0 text-muted-foreground" />
				<input
					type="text"
					role="combobox"
					aria-expanded={showDropdown}
					aria-controls="hero-search-list"
					aria-autocomplete="list"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					onBlur={() => setTimeout(() => setOpen(false), 120)}
					onKeyDown={onKeyDown}
					placeholder={t("placeholder")}
					className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
				/>
				<button
					type="button"
					onClick={submit}
					aria-label={t("placeholder")}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<ArrowRight className="h-4 w-4" />
				</button>
			</div>

			{showDropdown && (
				<ul
					id="hero-search-list"
					role="listbox"
					className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg"
				>
					{results.length === 0 ? (
						<li className="px-4 py-3 text-sm text-muted-foreground">
							{t("noResults")}
						</li>
					) : (
						results.map((doc, i) => (
							<li
								key={doc.id}
								role="option"
								aria-selected={i === active}
								onMouseEnter={() => setActive(i)}
								onMouseDown={(e) => {
									e.preventDefault();
									go(doc);
								}}
								className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
									i === active ? "bg-primary/10" : ""
								}`}
							>
								<span className="truncate font-medium text-foreground">
									{doc.name}
								</span>
								<span className="shrink-0 text-xs text-muted-foreground">
									{doc.categoryName}
								</span>
							</li>
						))
					)}
				</ul>
			)}
		</div>
	);
}
