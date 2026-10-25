import { BookOpen, ChevronDown } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaToolsSection } from "@/components/media-tools-section";
import { HeroSearchInput } from "@/components/search/hero-search-input";
import { ToolCard } from "@/components/tool-card";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { blogPosts } from "@/lib/blog/posts";
import { categories, getCategoryById } from "@/lib/registry/categories";
import {
	converterRegistry,
	getConvertersByCategory,
} from "@/lib/registry/converters";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

// Curated popular tools (real entries from the registry; 12 per the redesign spec)
const popularToolIds = [
	"basic-calculator",
	"percentage-calculator",
	"unit-converter",
	"currency",
	"bmi",
	"loan",
	"compound-interest",
	"body-fat",
	"age",
	"time-duration",
	"rgb",
	"mortgage",
];

const hotChipCategories = [
	"math",
	"finance",
	"health",
	"photo",
	"color",
	"datetime",
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

	const popularTools = popularToolIds
		.map((id) => converterRegistry[id])
		.filter((c): c is NonNullable<typeof c> => Boolean(c));

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
			{/* ===== Hero ===== */}
			<section className="relative overflow-hidden border-b border-border bg-background">
				<div className="mx-auto w-full max-w-3xl px-4 py-14 text-center sm:py-20">
					<span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
						{t("heroBadge")}
					</span>
					<h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
						{t("homepageTitle")}
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
						{t("tagline")}
					</p>

					<div className="mx-auto mt-7 max-w-xl">
						<HeroSearchInput />
					</div>

					<div className="mt-5 flex flex-wrap justify-center gap-2">
						{hotChipCategories.map((id) => (
							<Link
								key={id}
								href={`/${getCategoryById(id)?.slug}`}
								className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
							>
								{nav(`${id}.name`)}
							</Link>
						))}
					</div>
				</div>
			</section>

			<div className="mx-auto max-w-6xl px-4">
				{/* ===== Media tools (image & video) ===== */}
				<MediaToolsSection />

				{/* ===== All Categories ===== */}
				<section className="pb-10 pt-2">
					<h2 className="mb-1 text-xl font-bold text-foreground">
						{th("categoriesTitle")}
					</h2>
					<p className="mb-4 text-sm text-muted-foreground">
						{th("categoriesDesc")}
					</p>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{categories.map((c) => {
							const count = getConvertersByCategory(c.id).length;
							return (
								<ToolCard
									key={c.id}
									icon={c.icon}
									title={nav(`${c.id}.name`)}
									meta={`${count} ${t("toolsCount")}`}
									description={th(`categoryDesc.${c.id}`)}
									href={`/${c.slug}`}
								/>
							);
						})}
					</div>
				</section>

				{/* ===== Popular Tools (curated 12) ===== */}
				<section className="pb-10">
					<div className="mb-4 flex items-end justify-between">
						<h2 className="text-xl font-bold text-foreground">
							{t("hotTools")}
						</h2>
						<Link
							href="/all"
							className="text-sm font-medium text-primary hover:underline"
						>
							{t("homepageViewAll")}
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{popularTools.map((converter) => (
							<ToolCard
								key={converter.id}
								icon={converter.icon}
								title={tc(`${converter.id}.name`)}
								description={tc(`${converter.id}.description`)}
								href={`/${getCategoryById(converter.category)?.slug}/${converter.slug}`}
							/>
						))}
					</div>
				</section>

				{/* ===== Why choose us ===== */}
				<section className="pb-10">
					<h2 className="mb-4 text-xl font-bold text-foreground">
						{th("whyTitle")}
					</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{whyItems.map((item) => (
							<div
								key={item.title}
								className="rounded-xl border border-border bg-card p-4 shadow-sm"
							>
								<h3 className="font-semibold text-foreground">{item.title}</h3>
								<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
									{item.desc}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* ===== Featured Articles & Guides (4) ===== */}
				<section className="pb-12">
					<div className="mb-4 flex items-end justify-between">
						<div>
							<h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
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
						{blogPosts.slice(0, 4).map((post) => (
							<Link
								key={post.slug}
								href={`/blog/${post.slug}`}
								className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md"
							>
								<div>
									<div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
										<span className="rounded-md bg-muted px-2 py-0.5 font-medium">
											{tBlog(`categoryLabels.${post.category}`)}
										</span>
										<span>{post.readingMinutes} min</span>
									</div>
									<h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
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
					<h2 className="mb-4 text-xl font-bold text-foreground">
						{th("faqTitle")}
					</h2>
					<div className="space-y-2">
						{homeFaq.map((item) => (
							<details
								key={item.q}
								className="group rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
							>
								<summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-foreground">
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
		</>
	);
}
