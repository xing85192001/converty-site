"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { categories, getCategoryBySlug, getSubcategoriesByCategoryId } from "@/lib/registry/categories";
import { subcatNames } from "@/lib/registry/subcat-names";
import { getConvertersByCategoryGrouped } from "@/lib/registry/converters";
import { blogPosts } from "@/lib/blog/posts";
import { cn } from "@/lib/utils";

export function CategoryView({ categorySlug }: { categorySlug: string }) {
	const t = useTranslations("common");
	const nav = useTranslations("nav");
	const tc = useTranslations("converter");
	const tcat = useTranslations("category");
	const tb = useTranslations("blog.posts");
	const locale = useLocale();

	// Resolve a localized subcategory display name; falls back to the English
	// source name (from categories.ts) for `en` and any untranslated locale.
	const subcatLabel = (subId: string): string => {
		const localized = subcatNames[`${category?.id}.${subId}`]?.[locale];
		if (localized) return localized;
		if (subId === "uncategorized") return t("other");
		return subcats.find((s) => s.id === subId)?.name ?? subId;
	};
	const category = getCategoryBySlug(categorySlug);
	const grouped = getConvertersByCategoryGrouped(category?.id ?? categorySlug);
	const catDesc = tcat(`${category?.id}.description`);
	const catIntro = tcat(`${category?.id}.intro`);
	const description =
		catDesc && catDesc !== `${category?.id}.description` ? catDesc : category?.description ?? "";
	const relatedPosts = blogPosts.filter((p) => p.category === category?.id);

	const [query, setQuery] = useState("");
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [activeSub, setActiveSub] = useState<string>("all");

	const subcats = category ? getSubcategoriesByCategoryId(category.id) : [];

	const allTools = useMemo(
		() => Array.from(grouped.values()).flat(),
		[grouped],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return allTools;
		return allTools.filter(
			(t) =>
				tc(`${t.id}.name`).toLowerCase().includes(q) ||
				tc(`${t.id}.description`).toLowerCase().includes(q),
		);
	}, [query, allTools, tc]);

	// When the category has subcategories, group tools by subcategory.
	const groups = useMemo(() => {
		const hasSubcats = subcats.length > 0;
		if (!hasSubcats) return null;
		return Array.from(grouped.entries()).map(([subId, tools]) => {
			return { subId, name: subcatLabel(subId), tools };
		});
	}, [grouped, subcats, t, locale, category?.id]);

	if (!category) return null;

	const tree = (
		<nav className="space-y-1">
			<Link
				href="/"
				className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			>
				{t("home")}
			</Link>
			{categories.map((c) => {
				const active = c.id === category.id;
				return (
					<Link
						key={c.id}
						href={`/${c.slug}`}
						onClick={() => setDrawerOpen(false)}
						className={cn(
							"flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
							active
								? "bg-primary/10 font-semibold text-primary"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						<c.icon className="h-4 w-4 shrink-0" />
						<span className="truncate">{nav(`${c.id}.name`)}</span>
					</Link>
				);
			})}
		</nav>
	);

	return (
		<div className="mx-auto max-w-6xl px-4 py-6">
			<button
				type="button"
				onClick={() => setDrawerOpen(true)}
				className="mb-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium lg:hidden"
			>
				☰ {t("navigation.categories")}
			</button>

			<div className="flex gap-6">
				{/* Desktop sidebar (collapsible) */}
				<aside
					className={cn(
						"hidden shrink-0 lg:block",
						collapsed ? "w-0 overflow-hidden opacity-0" : "w-[260px]",
					)}
				>
					<div className="sticky top-20 rounded-xl border border-border bg-card p-3">
						<div className="flex items-center justify-between px-1 pb-2">
							<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{t("navigation.categories")}
							</span>
							<button
								type="button"
								onClick={() => setCollapsed(true)}
								className="text-xs text-muted-foreground hover:text-primary"
								aria-label="Collapse"
							>
								«
							</button>
						</div>
						{tree}
					</div>
				</aside>

				{/* Expand button when collapsed */}
				{collapsed && (
					<button
						type="button"
						onClick={() => setCollapsed(false)}
						className="hidden h-9 shrink-0 rounded-xl border border-border bg-card px-2 text-muted-foreground hover:text-primary lg:block"
						aria-label="Expand"
					>
						»
					</button>
				)}

				{/* Mobile drawer */}
				{drawerOpen && (
					<div className="fixed inset-0 z-50 lg:hidden">
						<div
							className="absolute inset-0 bg-black/40"
							onClick={() => setDrawerOpen(false)}
						/>
						<aside className="absolute left-0 top-0 h-full w-[260px] overflow-y-auto bg-card p-3 shadow-xl">
							<div className="flex items-center justify-between px-1 pb-2">
								<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									{t("navigation.categories")}
								</span>
								<button
									type="button"
									onClick={() => setDrawerOpen(false)}
									className="text-muted-foreground"
									aria-label="Close"
								>
									✕
								</button>
							</div>
							{tree}
						</aside>
					</div>
				)}

				{/* Main content */}
				<div className="min-w-0 flex-1">
					<nav className="mb-3 text-sm text-muted-foreground">
						<Link href="/" className="hover:text-primary">
							{t("home")}
						</Link>{" "}
						/{" "}
						<span className="text-foreground">
							{nav(`${category.id}.name`)}
						</span>
					</nav>

					<div className="mb-4 flex items-center gap-3">
						<category.icon className="h-7 w-7 text-primary" />
						<div>
							<h1 className="text-2xl font-bold tracking-tight">
								{nav(`${category.id}.name`)}
							</h1>
						</div>
					</div>
					<p className="mb-4 text-muted-foreground">{description}</p>
					{catIntro && catIntro !== `${category?.id}.intro` && (
						<div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
							{catIntro}
						</div>
					)}

					<div className="relative mb-4 max-w-md">
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={t("search.placeholder")}
							className="w-full rounded-xl border border-border bg-card py-2.5 pl-3 pr-3 text-sm outline-none transition focus:border-primary"
						/>
					</div>

					{/* Subcategory filter chips (only when the category has subcategories) */}
					{subcats.length > 0 && (
						<div className="mb-5 flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => {
									setQuery("");
									setActiveSub("all");
								}}
								className={cn(
									"rounded-full border px-3 py-1 text-xs transition-colors",
									activeSub === "all" && query.trim() === ""
										? "border-primary bg-primary/10 font-medium text-primary"
										: "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
								)}
							>
								{t("allTools")}
							</button>
							{subcats.map((s) => {
								const count = (grouped.get(s.id) ?? []).length;
								const isActive = activeSub === s.id && query.trim() === "";
								return (
									<button
										key={s.id}
										type="button"
										onClick={() => {
											setQuery("");
											setActiveSub(s.id);
										}}
										className={cn(
											"rounded-full border px-3 py-1 text-xs transition-colors",
											isActive
												? "border-primary bg-primary/10 font-medium text-primary"
												: "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
										)}
									>
										{subcatLabel(s.id)} <span className="text-muted-foreground/70">{count}</span>
									</button>
								);
							})}
						</div>
					)}

					{/* Search mode: show flat filtered results */}
					{query.trim() ? (
						<div
							className="grid gap-3"
							style={{
								gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
							}}
						>
							{filtered.map((tool) => {
								const Icon = tool.icon;
								return (
									<Link
										key={tool.id}
										href={`/${categorySlug}/${tool.slug}`}
										className="block rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
									>
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
											<Icon className="h-5 w-5" />
										</div>
										<h3 className="mt-3 font-semibold">
											{tc(`${tool.id}.name`)}
										</h3>
										<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
											{tc(`${tool.id}.description`)}
										</p>
									</Link>
								);
							})}
							{filtered.length === 0 && (
								<p className="text-sm text-muted-foreground">
									{t("search.noResults")}
								</p>
							)}
						</div>
					) : groups ? (
						/* Grouped by subcategory (optionally filtered by the active subcategory chip) */
						<div className="space-y-6">
							{(activeSub === "all"
								? groups
								: groups.filter((g) => g.subId === activeSub)
							).map((group) => (
								<div key={group.subId}>
									<h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
										{group.name}
										<span className="text-xs font-normal text-muted-foreground">
											{group.tools.length}
										</span>
									</h2>
									<div
										className="grid gap-3"
										style={{
											gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
										}}
									>
										{group.tools.map((tool) => {
											const Icon = tool.icon;
											return (
												<Link
													key={tool.id}
													href={`/${categorySlug}/${tool.slug}`}
													className="block rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
												>
													<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
														<Icon className="h-5 w-5" />
													</div>
													<h3 className="mt-3 font-semibold">
														{tc(`${tool.id}.name`)}
													</h3>
													<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
														{tc(`${tool.id}.description`)}
													</p>
												</Link>
											);
										})}
									</div>
								</div>
							))}
						</div>
					) : (
						/* No subcategories: flat grid */
						<div
							className="grid gap-3"
							style={{
								gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
							}}
						>
							{allTools.map((tool) => {
								const Icon = tool.icon;
								return (
									<Link
										key={tool.id}
										href={`/${categorySlug}/${tool.slug}`}
										className="block rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
									>
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
											<Icon className="h-5 w-5" />
										</div>
										<h3 className="mt-3 font-semibold">
											{tc(`${tool.id}.name`)}
										</h3>
										<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
											{tc(`${tool.id}.description`)}
										</p>
									</Link>
								);
							})}
						</div>
					)}

					{/* Related articles (content cluster -> internal links) */}
					{relatedPosts.length > 0 && (
						<div className="mt-8 border-t border-border pt-6">
							<h2 className="mb-3 text-base font-semibold">{t("relatedArticles")}</h2>
							<ul className="grid gap-2 sm:grid-cols-2">
								{relatedPosts.map((p) => (
									<li key={p.slug}>
										<Link
											href={`/blog/${p.slug}`}
											className="block rounded-xl border border-border bg-card p-3 text-sm transition-colors hover:border-primary"
										>
											<span className="font-medium">{tb(`${p.slug}.title`)}</span>
											<span className="ml-2 text-xs text-muted-foreground">{p.readingMinutes} min</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Related categories + sitemap (contextual internal links) */}
					<div className="mt-8 border-t border-border pt-6">
						<h2 className="mb-3 text-base font-semibold">
							{t("relatedCategories")}
						</h2>
						<div className="flex flex-wrap gap-2">
							{categories
								.filter((c) => c.id !== category.id)
								.map((c) => (
									<Link
										key={c.id}
										href={`/${c.slug}`}
										className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
									>
										{nav(`${c.id}.name`)}
									</Link>
								))}
						</div>
						<div className="mt-4">
							<Link
								href="/sitemap"
								className="text-sm font-medium text-primary hover:underline"
							>
								{t("sitemapTitle")} →
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
