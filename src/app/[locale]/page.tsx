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
    <div className="relative overflow-hidden">
      {/* Hero background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container py-12 sm:py-16">
        <div className="mx-auto max-w-4xl text-center mb-14">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-5 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            {t("siteName")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("tagline")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/${category.slug}`}>
              <Card className="h-full group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div className="pt-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {tc(`${category.id}.name`)}
                      </CardTitle>
                      <CardDescription>{tc(`${category.id}.description`)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
