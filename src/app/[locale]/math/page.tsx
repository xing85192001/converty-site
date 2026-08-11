import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getCategoryBySlug } from "@/lib/registry/categories";
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
  const t = await getTranslations({ locale, namespace: "nav.math" });

  return {
    title: t("name"),
    description: t("description"),
  };
}

export default async function MathPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("nav.math");
  const tConverters = await getTranslations("converter");

  const category = getCategoryBySlug("math")!;
  const converters = getConvertersByCategory("math");

  // Group converters by subcategory
  const subcategories = ["basic", "algebra", "geometry", "statistics", "numbers", "advanced"];
  const grouped = subcategories
    .map((sub) => ({
      id: sub,
      converters: converters.filter((c) => c.subcategory === sub),
    }))
    .filter((g) => g.converters.length > 0);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <category.icon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t("name")}</h1>
        </div>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {grouped.map((group) => (
        <div key={group.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize">{group.id}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.converters.map((converter) => (
              <Link key={converter.id} href={`/math/${converter.slug}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{tConverters(`${converter.id}.name`)}</CardTitle>
                    <CardDescription>{tConverters(`${converter.id}.description`)}</CardDescription>
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
