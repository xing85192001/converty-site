export type BlogCategory = "finance" | "health" | "math" | "cooking";

export type BlogBlock =
	| { type: "p"; text: string }
	| { type: "h2"; text: string }
	| { type: "ul"; items: string[] }
	| { type: "callout"; text: string };

/**
 * Locale-agnostic metadata for a blog post. The actual translated content
 * (title, excerpt, blocks) lives in messages under `blog.posts.{slug}`.
 */
export interface BlogPostBase {
	slug: string;
	date: string; // YYYY-MM-DD
	category: BlogCategory;
	readingMinutes: number;
}

/** A fully localized blog post, ready for rendering. */
export interface LocalizedBlogPost extends BlogPostBase {
	title: string;
	excerpt: string;
	blocks: BlogBlock[];
}

export const blogPosts: BlogPostBase[] = [
	{
		slug: "50-30-20-budget",
		date: "2026-08-11",
		category: "finance",
		readingMinutes: 4,
	},
	{
		slug: "compound-interest-early",
		date: "2026-08-11",
		category: "finance",
		readingMinutes: 4,
	},
	{
		slug: "bmi-body-fat-explained",
		date: "2026-08-11",
		category: "health",
		readingMinutes: 5,
	},
	{
		slug: "extra-mortgage-payments",
		date: "2026-08-11",
		category: "finance",
		readingMinutes: 4,
	},
	{
		slug: "percentages-in-everyday-life",
		date: "2026-08-11",
		category: "math",
		readingMinutes: 4,
	},
	{
		slug: "calories-bmr-tdee",
		date: "2026-08-11",
		category: "health",
		readingMinutes: 5,
	},
	{
		slug: "cooking-unit-conversions",
		date: "2026-08-11",
		category: "cooking",
		readingMinutes: 4,
	},
	{
		slug: "debt-snowball-vs-avalanche",
		date: "2026-08-11",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "equal-installment-vs-principal",
		date: "2026-08-28",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "credit-card-minimum-payment-trap",
		date: "2026-08-28",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "emergency-fund-how-many-months",
		date: "2026-08-28",
		category: "finance",
		readingMinutes: 4,
	},
	{
		slug: "inflation-purchasing-power",
		date: "2026-08-28",
		category: "finance",
		readingMinutes: 4,
	},
	{
		slug: "apr-vs-apy-interest-rate-basics",
		date: "2026-08-28",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "rent-vs-buy-decision",
		date: "2026-08-28",
		category: "finance",
		readingMinutes: 6,
	},
	{
		slug: "bmi-limitations-better-metrics",
		date: "2026-08-28",
		category: "health",
		readingMinutes: 5,
	},
	{
		slug: "bmr-tdee-how-many-calories",
		date: "2026-08-28",
		category: "health",
		readingMinutes: 5,
	},
	{
		slug: "daily-water-intake-guide",
		date: "2026-08-28",
		category: "health",
		readingMinutes: 4,
	},
	{
		slug: "waist-circumference-health-risk",
		date: "2026-08-28",
		category: "health",
		readingMinutes: 4,
	},
	{
		slug: "percentage-increase-decrease-guide",
		date: "2026-08-28",
		category: "math",
		readingMinutes: 5,
	},
	{
		slug: "common-unit-conversion-mistakes",
		date: "2026-08-28",
		category: "math",
		readingMinutes: 5,
	},
	{
		slug: "recipe-scaling-guide",
		date: "2026-08-28",
		category: "cooking",
		readingMinutes: 5,
	},
	{
		slug: "cooking-measurement-standards",
		date: "2026-08-28",
		category: "cooking",
		readingMinutes: 4,
	},
	{
		slug: "ratio-and-proportion-practical",
		date: "2026-08-28",
		category: "math",
		readingMinutes: 4,
	},
	{
		slug: "how-much-house-can-you-afford",
		date: "2026-08-28",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "protein-intake-how-much",
		date: "2026-08-28",
		category: "health",
		readingMinutes: 5,
	},
	{
		slug: "average-mean-median-mode",
		date: "2026-08-28",
		category: "math",
		readingMinutes: 5,
	},
	{
		slug: "car-loan-total-cost",
		date: "2026-08-28",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "food-cost-per-serving",
		date: "2026-08-28",
		category: "cooking",
		readingMinutes: 4,
	},
	{
		slug: "rounding-and-significant-figures",
		date: "2026-08-28",
		category: "math",
		readingMinutes: 4,
	},
	{
		slug: "sleep-cycles-when-to-wake",
		date: "2026-08-28",
		category: "health",
		readingMinutes: 4,
	},
	{
		slug: "compound-interest-wealth-building",
		date: "2026-08-29",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "currency-exchange-how-it-works",
		date: "2026-08-29",
		category: "finance",
		readingMinutes: 4,
	},
	{
		slug: "mortgage-amortization-explained",
		date: "2026-08-29",
		category: "finance",
		readingMinutes: 6,
	},
	{
		slug: "roi-evaluating-investments",
		date: "2026-08-29",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "calorie-deficit-weight-loss",
		date: "2026-08-29",
		category: "health",
		readingMinutes: 5,
	},
	{
		slug: "heart-rate-training-zones",
		date: "2026-08-29",
		category: "health",
		readingMinutes: 4,
	},
	{
		slug: "high-yield-savings-vs-regular",
		date: "2026-08-30",
		category: "finance",
		readingMinutes: 5,
	},
	{
		slug: "pay-yourself-first-system",
		date: "2026-08-30",
		category: "finance",
		readingMinutes: 4,
	},
	{
		slug: "vo2-max-cardio-fitness",
		date: "2026-08-30",
		category: "health",
		readingMinutes: 5,
	},
	{
		slug: "body-fat-vs-bmi",
		date: "2026-08-30",
		category: "health",
		readingMinutes: 5,
	},
	{
		slug: "mental-percentage-tricks",
		date: "2026-08-30",
		category: "math",
		readingMinutes: 4,
	},
	{
		slug: "grams-to-cups-conversion",
		date: "2026-08-30",
		category: "cooking",
		readingMinutes: 4,
	},
];

export function getPostBySlug(slug: string): BlogPostBase | undefined {
	return blogPosts.find((post) => post.slug === slug);
}

export function getPostsByCategory(
	category: BlogCategory | "all",
): BlogPostBase[] {
	if (category === "all") return blogPosts;
	return blogPosts.filter((post) => post.category === category);
}

/** Localize a single post using a next-intl translator for `blog.posts`. */
export function localizePost(
	post: BlogPostBase,
	t: (key: string) => string,
): LocalizedBlogPost {
	const raw = (t as unknown as { raw: (key: string) => BlogBlock[] }).raw;
	return {
		...post,
		title: t(`${post.slug}.title`),
		excerpt: t(`${post.slug}.excerpt`),
		blocks: raw(`${post.slug}.blocks`),
	};
}

/** Localize a list of posts using a next-intl translator for `blog.posts`. */
export function localizePosts(
	posts: BlogPostBase[],
	t: (key: string) => string,
): LocalizedBlogPost[] {
	return posts.map((post) => localizePost(post, t));
}
