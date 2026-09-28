"use client";

import { Menu, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GlobalSearch } from "@/components/search/global-search";
import { Button } from "@/components/ui/button";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { Link } from "@/i18n/navigation";
import { categories, getCategoryById } from "@/lib/registry/categories";
import { getConvertersByCategory } from "@/lib/registry/converters";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

// Category pills shown directly in the dark header bar (tooldone-style).
// Keep this list short — the bar must fit logo + pills + 所有工具 + 博客 without truncation.
const pillCategoryIds = [
	"math",
	"finance",
	"health",
	"datetime",
	"cooking",
	"color",
];

export function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [megaOpen, setMegaOpen] = useState(false);
	const t = useTranslations("common");
	const nav = useTranslations("nav");

	// Close the mega menu when clicking anywhere outside it (click-to-open support).
	useEffect(() => {
		if (!megaOpen) return;
		const close = () => setMegaOpen(false);
		document.addEventListener("click", close);
		return () => document.removeEventListener("click", close);
	}, [megaOpen]);

	return (
		<header className="dark-header sticky top-0 z-50 border-b border-white/10 bg-[#0E211C]">
			<div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
				{/* Logo (single) */}
				<Link
					href="/"
					className="flex shrink-0 items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-3.5 shadow-sm"
				>
					<img
						src="/logo.jpg"
						alt="baikecalc"
						className="h-7 w-7 rounded-lg object-cover"
					/>
					<span className="text-base font-extrabold tracking-tight text-[#0E211C]">
						baike<span className="text-primary">calc</span>
					</span>
				</Link>

				{/* Nav */}
			<nav className="hidden min-w-0 flex-1 items-center gap-1.5 lg:flex">
				{/* Inner wrapper owns the horizontal scroll so the nav itself does NOT clip
				    the absolutely-positioned mega menu (overflow-x:auto forces overflow-y:auto). */}
				<div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-hide">
				{pillCategoryIds.map((id) => {
					const c = getCategoryById(id);
					if (!c) return null;
					return (
						<Link
							key={id}
							href={`/${c.slug}`}
							className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/85 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
						>
							<c.icon className="h-3.5 w-3.5" />
							{nav(`${id}.name`)}
						</Link>
					);
				})}
				</div>

				{/* All categories mega menu */}
				<div className="group relative shrink-0">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setMegaOpen((v) => !v);
						}}
						aria-expanded={megaOpen}
						className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
					>
							{t("allTools")}
							<svg
								className={cn(
									"h-4 w-4 transition-transform",
									(megaOpen || undefined) && "rotate-180",
									"group-hover:rotate-180",
								)}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>
						<div
							onClick={(e) => e.stopPropagation()}
							className={cn(
								"absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 pt-2 transition-all",
								megaOpen
									? "visible opacity-100"
									: "invisible opacity-0 group-hover:visible group-hover:opacity-100",
							)}
						>
							<div className="light-panel rounded-xl border border-border bg-popover p-5 shadow-lg">
								<div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									{t("allTools")}
								</div>
								<div className="grid grid-cols-4 gap-3">
									{categories.map((c) => {
										const count = getConvertersByCategory(c.id).length;
										return (
											<Link
												key={c.id}
												href={`/${c.slug}`}
												className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-sm transition-colors hover:border-primary hover:bg-muted"
											>
												<c.icon className="h-4 w-4 shrink-0 text-primary" />
												<span className="truncate font-medium">
													{nav(`${c.id}.name`)}
												</span>
												<span className="ml-auto text-xs text-muted-foreground">
													{count}
												</span>
											</Link>
										);
									})}
								</div>
								<Link
									href="/all"
									className="mt-3 inline-flex items-center text-xs text-muted-foreground hover:text-primary"
								>
									{t("homepageViewAll")} →
								</Link>
							</div>
						</div>
					</div>

				<Link
					href="/blog"
					className="flex shrink-0 items-center rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/85 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
				>
					{t("blog")}
				</Link>
			</nav>

				{/* Actions */}
				<div className="ml-auto flex shrink-0 items-center gap-1">
					{/* Compact search icon — opens the same command palette as the hero search (no duplicate bar) */}
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 text-white/80 hover:bg-white/10 hover:text-white"
						onClick={() => window.dispatchEvent(new Event("open-global-search"))}
						aria-label={t("search.placeholder")}
					>
						<Search className="h-[18px] w-[18px]" />
					</Button>
					<InstallPrompt />
					<LanguageSwitcher />
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
						onClick={() => setMenuOpen(!menuOpen)}
						aria-label="Menu"
					>
						{menuOpen ? (
							<X className="h-[18px] w-[18px]" />
						) : (
							<Menu className="h-[18px] w-[18px]" />
						)}
					</Button>
				</div>
			</div>

			{/* Global search (triggerless; opens via Ctrl/Cmd+K, header input or hero input) */}
			<div className="light-panel">
				<GlobalSearch trigger={false} />
			</div>

			{/* Mobile drawer */}
			{menuOpen && (
				<div className="light-panel border-t border-border bg-background md:hidden">
					<div className="mx-auto max-h-[70vh] overflow-y-auto px-4 py-3">
						<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							{t("navigation.moreTools")}
						</div>
						<div className="grid grid-cols-2 gap-1">
							{categories.map((c) => (
								<Link
									key={c.id}
									href={`/${c.slug}`}
									onClick={() => setMenuOpen(false)}
									className="rounded-lg px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-muted"
								>
									{nav(`${c.id}.name`)}
								</Link>
							))}
						</div>
						<div className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
							<Link
								href="/all"
								onClick={() => setMenuOpen(false)}
								className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
							>
								{t("allTools")}
							</Link>
							<Link
								href="/blog"
								onClick={() => setMenuOpen(false)}
								className="rounded-lg px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-muted"
							>
								{t("blog")}
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
