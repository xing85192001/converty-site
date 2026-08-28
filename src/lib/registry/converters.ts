import type { ConverterMeta } from "@/types";

// Import category-specific converter registries
import { automotiveConverters } from "./automotive-converters";
import { chemistryConverters } from "./chemistry-converters";
import { colorConverters } from "./color-converters";
import { cookingConverters } from "./cooking-converters";
import { cryptoConverters } from "./crypto-converters";
import { dataConverters } from "./data-converters";
import { datetimeConverters } from "./datetime-converters";
import { engineeringConverters } from "./engineering-converters";
import { financeConverters } from "./finance-converters";
import { healthConverters } from "./health-converters";
import { infrastructureConverters } from "./infrastructure-converters";
import { mathConverters } from "./math-converters";
import { musicConverters } from "./music-converters";
import { networkConverters } from "./network-converters";
import { photoConverters } from "./photo-converters";
import { physicsConverters } from "./physics-converters";
import { realestateConverters } from "./realestate-converters";
import { videoConverters } from "./video-converters";
import { webConverters } from "./web-converters";

// Merge all category registries into a single registry
export const converterRegistry: Record<string, ConverterMeta> = {
	...healthConverters,
	...infrastructureConverters,
	...engineeringConverters,
	...datetimeConverters,
	...colorConverters,
	...chemistryConverters,
	...cookingConverters,
	...automotiveConverters,
	...cryptoConverters,
	...dataConverters,
	...physicsConverters,
	...photoConverters,
	...musicConverters,
	...networkConverters,
	...videoConverters,
	...webConverters,
	...financeConverters,
	...realestateConverters,
	...mathConverters,
};

export function getConverterById(id: string): ConverterMeta | undefined {
	return converterRegistry[id];
}

/**
 * 按 URL slug 反查工具。多数工具页没有把 toolId 传给布局组件，
 * 因此内容区块需要能从路径（如 /zh/health/bmi）推断出是哪个工具。
 * slug 在不同分类下可能重名，所以可传入分类 slug 做精确匹配。
 */
export function getConverterBySlug(
	slug: string,
	categorySlug?: string,
): ConverterMeta | undefined {
	const matches = Object.values(converterRegistry).filter(
		(c) => c.slug === slug,
	);
	if (matches.length === 0) return undefined;
	if (matches.length === 1) return matches[0];
	if (categorySlug) {
		const exact = matches.find((c) => c.category === categorySlug);
		if (exact) return exact;
	}
	return matches[0];
}

export function getConvertersByCategory(categoryId: string): ConverterMeta[] {
	return Object.values(converterRegistry).filter(
		(converter) => converter.category === categoryId,
	);
}

export function getFeaturedConverters(): ConverterMeta[] {
	return Object.values(converterRegistry).filter((c) => c.featured);
}

export function getConvertersBySubcategory(
	categoryId: string,
	subcategoryId: string,
): ConverterMeta[] {
	return Object.values(converterRegistry).filter(
		(converter) =>
			converter.category === categoryId &&
			converter.subcategory === subcategoryId,
	);
}

export function getConvertersByCategoryGrouped(
	categoryId: string,
): Map<string, ConverterMeta[]> {
	const categoryConverters = getConvertersByCategory(categoryId);
	const grouped = new Map<string, ConverterMeta[]>();

	for (const converter of categoryConverters) {
		const subcategory = converter.subcategory ?? "uncategorized";
		const existing = grouped.get(subcategory) ?? [];
		grouped.set(subcategory, [...existing, converter]);
	}

	return grouped;
}

// Export all converters as an array
export const converters: ConverterMeta[] = Object.values(converterRegistry);
