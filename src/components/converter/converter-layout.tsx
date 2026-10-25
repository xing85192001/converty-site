"use client";

import { useLocale, useTranslations } from "next-intl";
import { AdUnit } from "@/components/ads/ad-unit";
import { Disclaimer } from "@/components/ads/disclaimer";
import { CalculatorErrorBoundary } from "@/components/error-boundary/calculator-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolCard } from "@/components/tool-card";
import { getCategoryById } from "@/lib/registry/categories";
import { getConvertersByCategory } from "@/lib/registry/converters";
import { Breadcrumbs } from "./breadcrumbs";
import { ToolContentSection } from "./tool-content-section";
import { EditorialTrust } from "@/components/blog/editorial-trust";

interface ConverterLayoutProps {
	title: string;
	description: string;
	categoryId: string;
	categoryName?: string;
	children: React.ReactNode;
	infoContent?: React.ReactNode;
	toolId?: string;
}

export function ConverterLayout({
	title,
	description,
	categoryId,
	categoryName,
	children,
	infoContent,
	toolId,
}: ConverterLayoutProps) {
	const t = useTranslations("common");
	const tc = useTranslations("converter");
	const locale = useLocale();
	const category = getCategoryById(categoryId);

	const categorySlug = category?.slug ?? categoryId;
	const related = getConvertersByCategory(categoryId)
		.filter((c) => c.id !== toolId)
		.slice(0, 4);

	// JSON-LD WebApplication schema (reserved SEO slot)
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: title,
		description,
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Any",
		inLanguage: locale,
		url: `https://baikecalc.com/${locale}/${categorySlug}/${toolId ?? ""}`,
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		author: { "@id": "https://baikecalc.com/#organization" },
		publisher: { "@id": "https://baikecalc.com/#organization" },
	};

	return (
		<div className="mx-auto max-w-5xl px-4 py-6">
			{/* JSON-LD WebApplication structured data (static, server-rendered) */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<Breadcrumbs
				categoryId={categoryId}
				current={title}
				categoryName={categoryName}
			/>

			<div className="mb-6 space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">{title}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>

			<Disclaimer categoryId={categoryId} />

			<Card className="mb-6 border-border">
				<CardContent className="pt-6">
					<CalculatorErrorBoundary>{children}</CalculatorErrorBoundary>
				</CardContent>
			</Card>

			<AdUnit slot="content-top" />

			{/* 已移除全站通用的「核心功能」模板段落。
			    原因：这组内容从 toolFeatures.core 共享池里挑选，在所有计算器之间完全重复
			    （boilerplate），不提供任何页面独有信息，是 AdSense「低价值内容」判定的主要来源。
			    每个工具的独特深度内容由下方 <ToolContentSection /> 承载。 */}

			{/* 已移除全站通用的「工具特点」模板段落（实时计算 / 多平台适配 / 历史记录）。
			    这三条在任何网站上都能写，零信息量，同样属于 boilerplate。
			    广告位 content-mid 保留。 */}
			<AdUnit slot="content-mid" />

			<ToolContentSection
				toolId={toolId ?? ""}
				toolName={title}
				toolDescription={description}
			/>

			{infoContent && (
				<Card className="mb-8 border-border">
					<CardHeader>
						<CardTitle className="text-lg">
							{t("aboutThisCalculator", { title })}
						</CardTitle>
					</CardHeader>
					<CardContent className="prose prose-sm max-w-none dark:prose-invert">
						{infoContent}
					</CardContent>
				</Card>
			)}

			{related.length > 0 && (
				<section className="mb-8">
					<h2 className="mb-3 text-lg font-bold tracking-tight">
						{t("navigation.moreTools")}
					</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{related.map((tool) => (
							<ToolCard
								key={tool.id}
								icon={tool.icon}
								title={tc(`${tool.id}.name`)}
								description={tc(`${tool.id}.description`)}
								href={`/${categorySlug}/${tool.slug}`}
							/>
						))}
					</div>
				</section>
			)}

			<EditorialTrust />

			<AdUnit slot="content-bottom" />
		</div>
	);
}
