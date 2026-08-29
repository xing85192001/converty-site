import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { blogPosts } from "@/lib/blog/posts";
import { categories } from "@/lib/registry/categories";
import { getConvertersByCategory } from "@/lib/registry/converters";

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "common" });
	return {
		title: t("sitemapTitle"),
		description: t("sitemapIntro"),
	};
}

export default async function SitemapPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("common");
	const tc = await getTranslations("converter");
	const tb = await getTranslations("blog");

	return (
		<div className="container py-10">
			<div className="mb-8">
				<h1 className="mb-2 text-3xl font-bold tracking-tight">
					{t("sitemapTitle")}
				</h1>
				<p className="text-muted-foreground">{t("sitemapIntro")}</p>
			</div>

			{/* 分类 → 全部工具 内链 */}
			{categories.map((cat) => {
				const convs = getConvertersByCategory(cat.id);
				if (!convs.length) return null;
				return (
					<section key={cat.id} className="mb-8">
						<h2 className="mb-3 text-xl font-semibold tracking-tight">
							{cat.name}
						</h2>
						<ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
							{convs.map((conv) => (
								<li key={conv.id}>
									<Link
										href={`/${cat.slug}/${conv.slug}`}
										className="text-sm text-muted-foreground transition-colors hover:text-primary"
									>
										{tc(`${conv.id}.name`)}
									</Link>
								</li>
							))}
						</ul>
					</section>
				);
			})}

			{/* 博客 内链 */}
			<section className="mb-8">
				<h2 className="mb-3 text-xl font-semibold tracking-tight">
					{t("blog")}
				</h2>
				<ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
					{blogPosts.map((post) => (
						<li key={post.slug}>
							<Link
								href={`/blog/${post.slug}`}
								className="text-sm text-muted-foreground transition-colors hover:text-primary"
							>
								{tb(`posts.${post.slug}.title`)}
							</Link>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
