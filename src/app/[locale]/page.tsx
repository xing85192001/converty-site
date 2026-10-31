import {
	ArrowRight,
	ChevronDown,
	DollarSign,
	Gift,
	Heart,
	ListChecks,
	type LucideIcon,
	Percent,
	ScrollText,
	ShieldCheck,
	Sparkles,
	UtensilsCrossed,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroIllustration } from "@/components/home/hero-illustration";
import { MediaToolsSection } from "@/components/media-tools-section";
import { HeroSearchInput } from "@/components/search/hero-search-input";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { blogPosts } from "@/lib/blog/posts";
import { categories, getCategoryById } from "@/lib/registry/categories";
import {
	converterRegistry,
	getConvertersByCategory,
} from "@/lib/registry/converters";
import { mediaTools } from "@/lib/registry/media-tools";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

// Curated popular tools (real registry entries; 6 per the reference layout)
const popularConverterIds = [
	"percentage-calculator",
	"unit-converter",
	"loan",
	"bmi",
	"time-duration",
];

// Quick category chips in the hero (real categories)
const hotChipCategories = [
	"math",
	"finance",
	"health",
	"photo",
	"video",
	"datetime",
];

// Soft tinted icon tiles for the hero chips (geometry stays uniform)
const chipTints: Record<string, string> = {
	math: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
	finance:
		"bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
	health: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
	photo:
		"bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
	video: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
	datetime: "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300",
};

// Soft tinted icon tiles for the popular-tool cards
const popularTints = [
	"bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
	"bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
	"bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
	"bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
	"bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
	"bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
];

const whyIcons = [ShieldCheck, ScrollText, Gift, ListChecks];

const blogCategoryIcons: Record<string, LucideIcon> = {
	finance: DollarSign,
	health: Heart,
	math: Percent,
	cooking: UtensilsCrossed,
};

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("common");
	const nav = await getTranslations("nav");
	const tc = await getTranslations("converter");
	const tBlog = await getTranslations("blog");
	const th = await getTranslations("home");
	const tm = await getTranslations("mediaTools");

	const popularTools = popularConverterIds
		.map((id) => converterRegistry[id])
		.filter((c): c is NonNullable<typeof c> => Boolean(c))
		.map((c) => ({
			icon: c.icon,
			title: tc(`${c.id}.name`),
			description: tc(`${c.id}.description`),
			href: `/${getCategoryById(c.category)?.slug}/${c.slug}`,
		}));

	// Sixth slot: a real media tool (image compressor) from the media registry.
	const mediaPick = mediaTools.find((m) => m.id === "image-compress");
	if (mediaPick) {
		const firstSentence = tm(`${mediaPick.descKey}`).split(/(?<=[.!?])\s/)[0];
		popularTools.push({
			icon: mediaPick.icon,
			title: tm(`${mediaPick.titleKey}`),
			description: firstSentence,
			href: `/tools/${mediaPick.slug}`,
		});
	}

	const whyItems = th.raw("whyItems") as { title: string; desc: string }[];
	const homeFaq = th.raw("faq") as { q: string; a: string }[];

	const faqJsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: homeFaq.map((item) => ({
			"@type": "Question",
			name: item.q,
			acceptedAnswer: { "@type": "Answer", text: item.a },
		})),
	};

	return (
		<>
			{/* ===== Hero: copy + search left, illustration right ===== */}
			<section className="relative overflow-hidden border-b border-border bg-background">
				<div className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
					<div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
						<div className="text-center lg:text-left">
							<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
								<Sparkles className="h-3.5 w-3.5" />
								{t("heroBadge")}
							</span>
							<h1 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[44px]">
								<span className="block text-foreground">{t("heroTitle1")}</span>
								<span className="block text-primary">{t("heroTitle2")}</span>
							</h1>
							<p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base lg:mx-0">
								{t("tagline")}
							</p>

							<div className="mx-auto mt-6 max-w-xl lg:mx-0">
								<HeroSearchInput />
							</div>
						</div>
						<div className="flex justify-center lg:justify-end">
							<HeroIllustration className="h-auto w-full max-w-[260px] lg:max-w-[300px]" />
						</div>
					</div>
					<div className="mt-5 flex flex-nowrap justify-center gap-2 overflow-x-auto lg:justify-start lg:col-span-2">
						{hotChipCategories.map((id) => {
							const c = getCategoryById(id);
							if (!c) return null;
							return (
								<Link
									key={id}
									href={`/${c.slug}`}
									className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
								>
									<span
										className={`flex h-5 w-5 items-center justify-center rounded-full ${
											chipTints[id] ?? "bg-primary/10 text-primary"
										}`}
									>
										<c.icon className="h-3 w-3" />
									</span>
									{nav(`${id}.name`)}
								</Link>
							);
						})}
					</div>
				</div>
			</section>

			<div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
				{/* ===== Popular Tools ===== */}
				<section>
					<div className="mb-4 flex items-end justify-between gap-4">
						<div>
							<h2 className="text-xl font-bold tracking-tight text-foreground">
								{t("hotTools")}
							</h2>
							<p className="mt-0.5 text-sm text-muted-foreground">
								{th("hotToolsDesc")}
							</p>
						</div>
						<Link
							href="/all"
							className="shrink-0 text-sm font-medium text-primary hover:underline"
						>
							{t("homepageViewAll")}
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
						{popularTools.map((tool, i) => (
							<Link
								key={tool.title}
								href={tool.href}
								className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
							>
								<span
									className={`flex h-10 w-10 items-center justify-center rounded-xl ${
										popularTints[i % popularTints.length]
									}`}
								>
									<tool.icon className="h-5 w-5" />
								</span>
								<h3 className="mt-3 text-[15px] font-semibold leading-snug text-foreground">
									{tool.title}
								</h3>
								<p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
									{tool.description}
								</p>
								<span className="mt-auto flex justify-end pt-3">
									<span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
										<ArrowRight className="h-3.5 w-3.5" />
									</span>
								</span>
							</Link>
						))}
					</div>
				</section>

				{/* ===== Explore Categories (all real categories) ===== */}
				<section>
					<div className="mb-4 flex items-end justify-between gap-4">
						<div>
							<h2 className="text-xl font-bold tracking-tight text-foreground">
								{th("categoriesTitle")}
							</h2>
							<p className="mt-0.5 text-sm text-muted-foreground">
								{th("categoriesDesc")}
							</p>
						</div>
						<Link
							href="/all"
							className="shrink-0 text-sm font-medium text-primary hover:underline"
						>
							{t("homepageViewAll")}
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{categories.map((c) => {
							const count = getConvertersByCategory(c.id).length;
							const desc = th(`categoryDesc.${c.id}`);
							return (
								<Link
									key={c.id}
									href={`/${c.slug}`}
									className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
								>
									<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
										<c.icon className="h-[18px] w-[18px]" />
									</span>
									<span className="min-w-0 flex-1">
										<span className="flex flex-wrap items-center gap-x-2">
											<b className="text-sm font-semibold text-foreground">
												{nav(`${c.id}.name`)}
											</b>
											<span className="text-xs text-muted-foreground">
												{count} {t("toolsCount")}
											</span>
										</span>
										<span
											className="mt-0.5 block truncate text-xs text-muted-foreground"
											title={desc}
										>
											{desc}
										</span>
									</span>
								</Link>
							);
						})}
					</div>
				</section>

				{/* ===== Three-up feature row ===== */}
				<div className="grid gap-4 lg:grid-cols-3">
					<MediaToolsSection />

					{/* Why BaikeCalc */}
					<section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
						<h2 className="text-base font-bold text-foreground">
							{th("whyTitle")}
						</h2>
						<p className="mt-1 text-xs text-muted-foreground">
							{th("whySubtitle")}
						</p>
						<ul className="mt-4 flex flex-1 flex-col justify-center gap-3.5">
							{whyItems.map((item, i) => {
								const Icon = whyIcons[i] ?? ShieldCheck;
								return (
									<li key={item.title} className="flex gap-3">
										<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<Icon className="h-4 w-4" />
										</span>
										<span className="min-w-0">
											<b className="block text-sm font-semibold text-foreground">
												{item.title}
											</b>
											<span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
												{item.desc}
											</span>
										</span>
									</li>
								);
							})}
						</ul>
					</section>

					{/* Latest from Our Blog */}
					<section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h2 className="text-base font-bold text-foreground">
									{th("blogTitle")}
								</h2>
								<p className="mt-1 text-xs text-muted-foreground">
									{th("guidesDesc")}
								</p>
							</div>
							<Link
								href="/blog"
								className="shrink-0 text-xs font-medium text-primary hover:underline"
							>
								{t("homepageViewAll")}
							</Link>
						</div>
						<ul className="mt-4 flex flex-1 flex-col justify-center gap-3.5">
							{blogPosts.slice(0, 4).map((post) => {
								const Icon = blogCategoryIcons[post.category] ?? Percent;
								return (
									<li key={post.slug}>
										<Link
											href={`/blog/${post.slug}`}
											className="group flex items-center gap-3"
										>
											<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<Icon className="h-5 w-5" />
											</span>
											<span className="min-w-0 flex-1">
												<b className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
													{tBlog(`posts.${post.slug}.title`)}
												</b>
												<span className="mt-0.5 block text-[11px] text-muted-foreground">
													{post.readingMinutes} {tBlog("minRead")}
												</span>
											</span>
										</Link>
									</li>
								);
							})}
						</ul>
					</section>
				</div>

				{/* ===== FAQ (kept for FAQPage structured data) ===== */}
				<section className="pb-2">
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
					/>
					<h2 className="mb-3 text-lg font-bold text-foreground">
						{th("faqTitle")}
					</h2>
					<div className="grid gap-2 md:grid-cols-2">
						{homeFaq.map((item) => (
							<details
								key={item.q}
								className="group rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
							>
								<summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground">
									<span>{item.q}</span>
									<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
								</summary>
								<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
									{item.a}
								</p>
							</details>
						))}
					</div>
				</section>
			</div>
		</>
	);
}
