import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/registry/categories";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const tc = await getTranslations("nav");

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">{t("siteName")}</h1>
        <p className="text-xl text-muted-foreground">{t("tagline")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/${category.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <category.icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{tc(`${category.id}.name`)}</CardTitle>
                    <CardDescription>{tc(`${category.id}.description`)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
