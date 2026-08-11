import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "nav.color" });

  return {
    title: t("name"),
    description: t("description"),
  };
}

export default async function ColorCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("nav.color");
  const tConverters = await getTranslations("converter");
  const category = getCategoryBySlug("color");
  const converters = getConvertersByCategory("color");

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("name")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {converters.map((converter) => {
          const converterT = (key: string) => {
            try {
              return tConverters(`${converter.id}.${key}`);
            } catch {
              return converter.id;
            }
          };

          return (
            <Link
              key={converter.id}
              href={`/color/${converter.slug}`}
              className="block p-6 bg-card rounded-lg border hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                {converter.icon && <converter.icon className="h-6 w-6 text-primary" />}
                <h2 className="text-lg font-semibold">{converterT("name")}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{converterT("description")}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
