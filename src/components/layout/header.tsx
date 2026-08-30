"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlobalSearch } from "@/components/search/global-search";
import { Button } from "@/components/ui/button";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { Link } from "@/i18n/navigation";
import { categories, getCategoryById } from "@/lib/registry/categories";
import { getConvertersByCategory } from "@/lib/registry/converters";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

// Categories featured in the "More Tools" mega menu
const MEGA_CATEGORIES = ["finance", "math", "data"];
const MEGA_BADGES: Record<string, "NEW" | "HOT"> = {
	currency: "HOT",
	loan: "HOT",
};

export function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const t = useTranslations("common");
	const nav = useTranslations("nav");
	const tc = useTranslations("converter");

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
				{/* Logo (single) */}
				<Link href="/" className="flex shrink-0 items-center gap-2">
					<img
						src="/logo.jpg"
						alt="baikecalc"
						className="h-9 w-9 rounded-xl object-cover shadow-sm"
					/>
					<span className="text-lg font-extrabold tracking-tight text-foreground">
						baike<span className="text-primary">calc</span>
					</span>
				</Link>

				{/* Nav */}
				<nav className="hidden items-center gap-1 md:flex">
					<Link
						href="/"
						className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						{t("home")}
					</Link>
					<Link
						href="/photo"
						className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						{nav("photo.name")}
					</Link>
					<Link
						href="/video"
						className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						{nav("video.name")}
					</Link>

					{/* More Tools mega menu */}
					<div className="group relative">
						<button
							type="button"
							className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							{t("navigation.moreTools")}
							<svg
								className="h-4 w-4 transition-transform group-hover:rotate-180"
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
						<div className="invisible absolute left-1/2 top-full w-[680px] -translate-x-1/2 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
							<div className="grid grid-cols-3 gap-6 rounded-xl border border-border bg-popover p-5 shadow-lg">
								{MEGA_CATEGORIES.map((catId) => {
									const cat = getCategoryById(catId);
									if (!cat) return null;
									const tools = getConvertersByCategory(catId).slice(0, 6);
									return (
										<div key={catId}>
											<div className="mb-2 text-sm font-semibold text-foreground">
												{nav(`${catId}.name`)}
											</div>
											<ul className="space-y-0.5">
												{tools.map((conv) => (
													<li key={conv.id}>
														<Link
															href={`/${cat.slug}/${conv.slug}`}
															className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
														>
															<conv.icon className="h-4 w-4 shrink-0" />
															<span className="truncate">
																{tc(`${conv.id}.name`)}
															</span>
															{MEGA_BADGES[conv.id] && (
																<span
																	className={cn(
																		"ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold",
																		MEGA_BADGES[conv.id] === "NEW"
																			? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
																			: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
																	)}
																>
																	{MEGA_BADGES[conv.id]}
																</span>
															)}
														</Link>
													</li>
												))}
											</ul>
											<Link
												href={`/${cat.slug}`}
												className="mt-2 inline-flex items-center text-xs text-muted-foreground hover:text-primary"
											>
												{t("homepageViewAll")} →
											</Link>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					<Link
						href="/blog"
						className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						{t("blog")}
					</Link>
					<Link
						href="/about"
						className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						{t("footer.links.about")}
					</Link>
				</nav>

				{/* Actions */}
				<div className="ml-auto flex shrink-0 items-center gap-1">
					<InstallPrompt />
					<LanguageSwitcher />
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
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

			{/* Global search (triggerless; opens via Ctrl/Cmd+K or hero input) */}
			<GlobalSearch trigger={false} />

			{/* Mobile drawer */}
			{menuOpen && (
				<div className="border-t border-border bg-background md:hidden">
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
