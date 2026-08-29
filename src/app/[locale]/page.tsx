import { BookOpen, ChevronDown } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaToolsSection } from "@/components/media-tools-section";
import { HeroSearch } from "@/components/search/hero-search";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { blogPosts } from "@/lib/blog/posts";
import { categories, getCategoryById } from "@/lib/registry/categories";
import {
	converterRegistry,
	getConvertersByCategory,
} from "@/lib/registry/converters";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

const quickToolIds = [
	"basic-calculator",
	"unit-converter",
	"percentage-calculator",
	"currency",
	"time-duration",
	"area-calculator",
	"rgb",
	"body-fat",
];

const quickBadges: Record<string, "NEW" | "HOT"> = {
	"unit-converter": "HOT",
};

const hotChipCategories = [
	"math",
	"finance",
	"datetime",
	"health",
	"color",
	"photo",
];

// Contextual internal-link groups: each links to a category page + its top tools.
const popularGroups: { categoryId: string; toolIds: string[] }[] = [
	{
		categoryId: "math",
		toolIds: [
			"percentage-calculator",
			"scientific-notation",
			"standard-deviation",
			"z-score-calculator",
			"statistics-calculator",
		],
	},
	{
		categoryId: "finance",
		toolIds: ["loan", "compound-interest", "currency", "tip", "mortgage"],
	},
	{
		categoryId: "health",
		toolIds: ["bmi", "body-fat", "ideal-weight", "water-intake"],
	},
	{
		categoryId: "datetime",
		toolIds: ["age", "time-duration"],
	},
	{
		categoryId: "color",
		toolIds: ["rgb"],
	},
	{
		categoryId: "photo",
		toolIds: ["depth-of-field", "hyperfocal", "golden-hour", "nd-filter"],
	},
];

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

	const quickTools = quickToolIds
		.map((id) => converterRegistry[id])
		.filter((c): c is NonNullable<typeof c> => Boolean(c));

	const renderQuickCard = (converter: (typeof quickTools)[number]) => {
		const name = tc(`${converter.id}.name`);
		const desc = tc(`${converter.id}.description`);
		const Icon = converter.icon;
		const badge = quickBadges[converter.id];
		return (
			<Link
				key={converter.id}
				href={`/${getCategoryById(converter.category)?.slug}/${converter.slug}`}
				className="group relative block rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
			>
				{badge && (
					<span
						className={cn(
							"absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold",
							badge === "NEW"
								? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
								: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
						)}
					>
						{badge}
					</span>
				)}
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Icon className="h-5 w-5" />
				</div>
				<h3 className="mt-3 font-semibold">{name}</h3>
				<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
					{desc}
				</p>
			</Link>
		);
	};

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
		<div className="mx-auto max-w-6xl px-4">
			{/* ===== Hero (compact) ===== */}
			<section className="py-6 text-center">
				<div className="mx-auto w-full max-w-2xl">
					<h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
						{t("siteName")}{" "}
						<span className="text-primary">{t("homepageTitle")}</span>
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">{t("tagline")}</p>

					<div className="mx-auto mt-4 max-w-xl">
						<HeroSearch />
					</div>

					<div className="mt-3 flex flex-wrap justify-center gap-2">
						{hotChipCategories.map((id) => (
							<Link
								key={id}
								href={`/${getCategoryById(id)?.slug}`}
								className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
							>
								{nav(`${id}.name`)}
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* ===== About the site (editorial intro) ===== */}
			<section className="pb-8">
				<h2 className="mb-2 text-lg font-bold">{th("introTitle")}</h2>
				<p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
					{th("intro")}
				</p>
			</section>

			{/* ===== Media tools (preserved feature) ===== */}
			<MediaToolsSection />

			{/* ===== Quick Tools ===== */}
			<section className="pb-6">
				<div className="mb-3 flex items-end justify-between">
					<h2 className="text-lg font-bold">{t("quickTools")}</h2>
					<Link
						href="/all"
						className="text-sm font-medium text-primary hover:underline"
					>
						{t("homepageViewAll")}
					</Link>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{quickTools.map(renderQuickCard)}
				</div>
			</section>

			{/* ===== Browse by Category (descriptive cards) ===== */}
			<section className="pb-8">
				<h2 className="mb-1 text-lg font-bold">{th("categoriesTitle")}</h2>
				<p className="mb-3 text-sm text-muted-foreground">
					{th("categoriesDesc")}
				</p>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{categories.map((c) => {
						const count = getConvertersByCategory(c.id).length;
						return (
							<Link
								key={c.id}
								href={`/${c.slug}`}
								className="group rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
							>
								<div className="flex items-center gap-2.5">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<c.icon className="h-4 w-4" />
									</div>
									<div className="min-w-0">
										<h3 className="truncate font-semibold">
											{nav(`${c.id}.name`)}
										</h3>
										<p className="text-xs text-muted-foreground">
											{count} {t("toolsCount")}
										</p>
									</div>
								</div>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{th(`categoryDesc.${c.id}`)}
								</p>
							</Link>
						);
					})}
				</div>
			</section>

			{/* ===== Hot Tools (preserved) ===== */}
			<section className="pb-8">
				<div className="mb-3 flex items-end justify-between">
					<h2 className="text-lg font-bold">{t("hotTools")}</h2>
					<Link
						href="/all"
						className="text-sm font-medium text-primary hover:underline"
					>
						{t("homepageViewAll")}
					</Link>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{[
						"bmi",
						"currency",
						"unit-converter",
						"percentage-calculator",
						"compound-interest",
						"loan",
						"basic-calculator",
						"body-fat",
					]
						.map((id) => converterRegistry[id])
						.filter((c): c is NonNullable<typeof c> => Boolean(c))
						.map((converter) => {
							const Icon = converter.icon;
							return (
								<Link
									key={converter.id}
									href={`/${getCategoryById(converter.category)?.slug}/${converter.slug}`}
									className="group block rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<Icon className="h-5 w-5" />
									</div>
									<h3 className="mt-2 font-semibold">
										{tc(`${converter.id}.name`)}
									</h3>
									<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
										{tc(`${converter.id}.description`)}
									</p>
								</Link>
							);
						})}
				</div>
			</section>

			{/* ===== Popular Calculators (contextual deep links) ===== */}
			<section className="pb-8">
				<h2 className="mb-1 text-lg font-bold">{th("popularTitle")}</h2>
				<p className="mb-4 text-sm text-muted-foreground">
					{th("popularDesc")}
				</p>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{popularGroups.map((group) => {
						const cat = getCategoryById(group.categoryId);
						if (!cat) return null;
						const tools = group.toolIds
							.map((id) => converterRegistry[id])
							.filter((c): c is NonNullable<typeof c> => Boolean(c));
						if (!tools.length) return null;
						return (
							<div
								key={group.categoryId}
								className="rounded-xl border border-border bg-card p-4"
							>
								<Link
									href={`/${cat.slug}`}
									className="mb-2 block font-semibold text-primary hover:underline"
								>
									{nav(`${group.categoryId}.name`)} →
								</Link>
								<ul className="space-y-1.5">
									{tools.map((converter) => (
										<li key={converter.id}>
											<Link
												href={`/${cat.slug}/${converter.slug}`}
												className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
											>
												{tc(`${converter.id}.name`)}
											</Link>
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>
			</section>

			{/* ===== Why choose us ===== */}
			<section className="pb-8">
				<h2 className="mb-3 text-lg font-bold">{th("whyTitle")}</h2>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{whyItems.map((item) => (
						<div
							key={item.title}
							className="rounded-xl border border-border bg-card p-4"
						>
							<h3 className="font-semibold">{item.title}</h3>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
								{item.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* ===== Featured Articles & Guides ===== */}
			<section className="pb-10">
				<div className="mb-4 flex items-end justify-between">
					<div>
						<h2 className="flex items-center gap-2 text-lg font-bold">
							<BookOpen className="h-5 w-5 text-primary" />
							{t("blog")}
						</h2>
						<p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
							{th("guidesDesc")}
						</p>
					</div>
					<Link
						href="/blog"
						className="shrink-0 text-sm font-medium text-primary hover:underline"
					>
						{t("homepageViewAll")}
					</Link>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{blogPosts.slice(0, 8).map((post) => (
						<Link
							key={post.slug}
							href={`/blog/${post.slug}`}
							className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-sm"
						>
							<div>
								<div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
									<span className="rounded-md bg-muted px-2 py-0.5 font-medium">
										{tBlog(`categoryLabels.${post.category}`)}
									</span>
									<span>{post.readingMinutes} min</span>
								</div>
								<h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">
									{tBlog(`posts.${post.slug}.title`)}
								</h3>
								<p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
									{tBlog(`posts.${post.slug}.excerpt`)}
								</p>
							</div>
							<div className="mt-3 text-xs font-medium text-primary">
								{tBlog("readMore")} →
							</div>
						</Link>
					))}
				</div>
			</section>

			{/* ===== Homepage FAQ ===== */}
			<section className="pb-12">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
				/>
				<h2 className="mb-3 text-lg font-bold">{th("faqTitle")}</h2>
				<div className="space-y-2">
					{homeFaq.map((item) => (
						<details
							key={item.q}
							className="group rounded-xl border border-border bg-card px-4 py-3"
						>
							<summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
								<span>{item.q}</span>
								<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
							</summary>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{item.a}
							</p>
						</details>
					))}
				</div>
			</section>
		</div>
	);
}
