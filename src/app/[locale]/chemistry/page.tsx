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
  const t = await getTranslations({ locale, namespace: "nav.chemistry" });

  return {
    title: t("name"),
    description: t("description"),
    keywords: [
      "chemistry",
      "chemical",
      "molecular",
      "molarity",
      "dilution",
      "periodic table",
      "stoichiometry",
      "pH",
      "calculator",
    ],
  };
}

export default async function ChemistryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("nav.chemistry");
  const tc = await getTranslations("converter");

  const category = getCategoryBySlug("chemistry")!;
  const converters = getConvertersByCategory("chemistry");

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <category.icon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t("name")}</h1>
        </div>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {converters.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {converters.map((converter) => (
            <Link key={converter.id} href={`/chemistry/${converter.slug}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">{tc(`${converter.id}.name`)}</CardTitle>
                  <CardDescription>{tc(`${converter.id}.description`)}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Chemistry calculators coming soon!</p>
        </div>
      )}
    </div>
  );
}
