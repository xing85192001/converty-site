"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getSubcategoriesByCategoryId } from "@/lib/registry/categories";
import { getConvertersByCategoryGrouped } from "@/lib/registry/converters";
import type { ConverterMeta } from "@/types";

interface SubcategoryNavProps {
  categoryId: string;
  categorySlug: string;
}

interface ConverterCardProps {
  converter: ConverterMeta;
  categorySlug: string;
}

function ConverterCard({ converter, categorySlug }: ConverterCardProps) {
  const Icon = converter.icon;
  const tConverters = useTranslations("converter");

  return (
    <Link href={`/${categorySlug}/${converter.slug}`} className="block group">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
              {tConverters(`${converter.id}.name`)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs line-clamp-2">
            {tConverters(`${converter.id}.description`)}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

interface SubcategorySectionProps {
  title: string;
  description?: string;
  converters: ConverterMeta[];
  categorySlug: string;
}

function SubcategorySection({
  title,
  description,
  converters,
  categorySlug,
}: SubcategorySectionProps) {
  if (converters.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {converters.map((converter) => (
          <ConverterCard key={converter.id} converter={converter} categorySlug={categorySlug} />
        ))}
      </div>
    </section>
  );
}

export function SubcategoryNav({ categoryId, categorySlug }: SubcategoryNavProps) {
  const subcategories = getSubcategoriesByCategoryId(categoryId);
  const groupedConverters = getConvertersByCategoryGrouped(categoryId);
  const tSub = useTranslations("nav.subcategories");

  // If no subcategories defined, show all converters in a flat list
  if (subcategories.length === 0) {
    const allConverters = groupedConverters.get("uncategorized") ?? [];
    const otherConverters = Array.from(groupedConverters.entries())
      .filter(([key]) => key !== "uncategorized")
      .flatMap(([, converters]) => converters);

    const converters = [...allConverters, ...otherConverters];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {converters.map((converter) => (
          <ConverterCard key={converter.id} converter={converter} categorySlug={categorySlug} />
        ))}
      </div>
    );
  }

  // Show converters grouped by subcategory
  return (
    <div className="space-y-8">
      {subcategories.map((subcategory) => {
        const converters = groupedConverters.get(subcategory.id) ?? [];
        return (
          <SubcategorySection
            key={subcategory.id}
            title={tSub(subcategory.id)}
            converters={converters}
            categorySlug={categorySlug}
          />
        );
      })}

      {/* Show uncategorized converters if any */}
      {groupedConverters.has("uncategorized") && (
        <SubcategorySection
          title={tSub("uncategorized")}
          converters={groupedConverters.get("uncategorized") ?? []}
          categorySlug={categorySlug}
        />
      )}
    </div>
  );
}
