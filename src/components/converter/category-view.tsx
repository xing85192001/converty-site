"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { categories, getCategoryBySlug } from "@/lib/registry/categories";
import { getConvertersByCategoryGrouped } from "@/lib/registry/converters";
import { cn } from "@/lib/utils";

export function CategoryView({ categorySlug }: { categorySlug: string }) {
	const t = useTranslations("common");
	const nav = useTranslations("nav");
	const tc = useTranslations("converter");
	const category = getCategoryBySlug(categorySlug);
	const grouped = getConvertersByCategoryGrouped(category?.id ?? categorySlug);

	const [query, setQuery] = useState("");
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

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
					<p className="mb-4 text-muted-foreground">{category.description}</p>

					<div className="relative mb-4 max-w-md">
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={t("search.placeholder")}
							className="w-full rounded-xl border border-border bg-card py-2.5 pl-3 pr-3 text-sm outline-none transition focus:border-primary"
						/>
					</div>

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
