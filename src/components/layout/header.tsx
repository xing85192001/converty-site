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

// Category links shown directly in the header (reference layout: plain text
// links, no pill borders). Keep this list short so the bar never overflows.
const navCategoryIds = [
	"math",
	"finance",
	"health",
	"photo",
	"video",
	"datetime",
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
		<header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur shadow-sm dark:border-border dark:bg-background/95">
			<div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
				{/* Logo + brand */}
				<Link
					href="/"
					className="flex shrink-0 items-center gap-2"
					aria-label="BaikeCalc"
				>
					<img
						src="/logo-cube.jpg"
						alt="BaikeCalc"
						width={32}
						height={32}
						className="h-8 w-8 rounded-lg object-cover shadow-sm"
					/>
					<span className="text-[17px] font-extrabold tracking-tight text-foreground">
						Baike<span className="text-primary">Calc</span>
					</span>
				</Link>

				{/* Nav */}
				<nav className="hidden min-w-0 flex-1 items-center gap-5 lg:flex">
					{/* Inner wrapper owns the horizontal scroll so the nav itself does NOT clip
					    the absolutely-positioned mega menu (overflow-x:auto forces overflow-y:auto). */}
					<div className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto scrollbar-hide">
						{navCategoryIds.map((id) => {
							const c = getCategoryById(id);
							if (!c) return null;
							return (
								<Link
									key={id}
									href={`/${c.slug}`}
									className="shrink-0 text-sm font-medium text-foreground/85 transition-colors hover:text-primary"
								>
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
							className="flex items-center gap-1 text-sm font-medium text-foreground/85 transition-colors hover:text-primary"
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
								"absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 pt-3 transition-all",
								megaOpen
									? "visible opacity-100"
									: "invisible opacity-0 group-hover:visible group-hover:opacity-100",
							)}
						>
							<div className="light-panel rounded-xl border border-border bg-popover p-5 shadow-lg">
								<div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									{t("allTools")}
								</div>
								<div className="grid grid-cols-4 gap-2">
									{categories.map((c) => {
										const count = getConvertersByCategory(c.id).length;
										return (
											<Link
												key={c.id}
												href={`/${c.slug}`}
												className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted"
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
				</nav>

				{/* Actions */}
				<div className="ml-auto flex shrink-0 items-center gap-1">
					{/* Compact search icon — opens the same command palette as the hero search (no duplicate bar) */}
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-primary"
						onClick={() =>
							window.dispatchEvent(new Event("open-global-search"))
						}
						aria-label={t("search.placeholder")}
					>
						<Search className="h-[18px] w-[18px]" />
					</Button>
					<LanguageSwitcher />
					<ThemeToggle />
					<Link
						href="/blog"
						className="ml-1 hidden text-sm font-medium text-foreground/85 transition-colors hover:text-primary md:block"
					>
						{t("blog")}
					</Link>
					<InstallPrompt />
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-primary md:hidden"
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
