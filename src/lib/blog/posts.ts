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
];

export function getPostBySlug(slug: string): BlogPostBase | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: BlogCategory | "all"): BlogPostBase[] {
  if (category === "all") return blogPosts;
  return blogPosts.filter((post) => post.category === category);
}

/** Localize a single post using a next-intl translator for `blog.posts`. */
export function localizePost(post: BlogPostBase, t: (key: string) => string): LocalizedBlogPost {
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
  t: (key: string) => string
): LocalizedBlogPost[] {
  return posts.map((post) => localizePost(post, t));
}
