import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/registry/categories";
import { converters } from "@/lib/registry/converters";

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
    title: t("allTools"),
    description: t("tagline"),
  };
}

export default async function AllToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const tc = await getTranslations("nav");
  const tConverters = await getTranslations("converter");

  // Group converters by category
  const groupedConverters = categories
    .map((category) => ({
      category,
      converters: converters.filter((c) => c.category === category.id),
    }))
    .filter((group) => group.converters.length > 0);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("allTools")}</h1>
        <p className="text-muted-foreground">{t("tagline")}</p>
      </div>

      {groupedConverters.map(({ category, converters: categoryConverters }) => (
        <div key={category.id} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <category.icon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">{tc(`${category.id}.name`)}</h2>
            <span className="text-sm text-muted-foreground">({categoryConverters.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryConverters.map((converter) => (
              <Link key={converter.id} href={`/${converter.category}/${converter.slug}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">
                      {tConverters(`${converter.id}.name`)}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {tConverters(`${converter.id}.description`)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
