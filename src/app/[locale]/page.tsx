import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaToolsSection } from "@/components/media-tools-section";
import { GlobalSearch } from "@/components/search/global-search";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { categories, getCategoryById } from "@/lib/registry/categories";
import { converterRegistry } from "@/lib/registry/converters";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const quickToolIds = [
  "basic-calculator",
  "unit-converter",
  "percentage-calculator",
  "currency",
  "time-duration",
  "area-calculator",
  "rgb",
  "body-fat",
];

const quickBadges: Record<string, "NEW" | "HOT"> = {
  "unit-converter": "HOT",
  rgb: "NEW",
  "body-fat": "NEW",
};

const hotChipCategories = ["math", "finance", "datetime", "health", "color", "photo"];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const nav = await getTranslations("nav");
  const tc = await getTranslations("converter");

  const quickTools = quickToolIds
    .map((id) => converterRegistry[id])
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const renderQuickCard = (converter: (typeof quickTools)[number]) => {
    const name = tc(`${converter.id}.name`);
    const desc = tc(`${converter.id}.description`);
    const Icon = converter.icon;
    const badge = quickBadges[converter.id];
    return (
      <Link
        key={converter.id}
        href={`/${getCategoryById(converter.category)?.slug}/${converter.slug}`}
        className="group relative block rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
      >
        {badge && (
          <span
            className={cn(
              "absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold",
              badge === "NEW"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
            )}
          >
            {badge}
          </span>
        )}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-3 font-semibold">{name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{desc}</p>
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ===== Hero (~60vh) ===== */}
      <section className="grid min-h-[60vh] place-items-center py-10 text-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            {t("siteName")}
            <span className="block text-primary">{t("homepageTitle")}</span>
          </h1>
          <p className="mt-4 text-muted-foreground">{t("tagline")}</p>

          <div className="mx-auto mt-8 max-w-xl">
            <GlobalSearch />
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {hotChipCategories.map((id) => (
              <Link
                key={id}
                href={`/${getCategoryById(id)?.slug}`}
                className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {nav(`${id}.name`)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Quick Tools ===== */}
      <section className="pb-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">{t("quickTools")}</h2>
          <Link href="/all" className="text-sm font-medium text-primary hover:underline">
            {t("homepageViewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {quickTools.map(renderQuickCard)}
        </div>
      </section>

      {/* ===== Browse by Category (tabs) ===== */}
      <section className="pb-10">
        <h2 className="mb-4 text-xl font-bold">{t("allCategories")}</h2>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <c.icon className="h-4 w-4" />
              {nav(`${c.id}.name`)}
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Hot Tools (preserved) ===== */}
      <section className="pb-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">{t("hotTools")}</h2>
          <Link href="/all" className="text-sm font-medium text-primary hover:underline">
            {t("homepageViewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Object.values(converterRegistry)
            .filter((c) => c.featured)
            .slice(0, 8)
            .map((converter) => {
              const Icon = converter.icon;
              return (
                <Link
                  key={converter.id}
                  href={`/${getCategoryById(converter.category)?.slug}/${converter.slug}`}
                  className="group block rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-semibold">{tc(`${converter.id}.name`)}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {tc(`${converter.id}.description`)}
                  </p>
                </Link>
              );
            })}
        </div>
      </section>

      {/* ===== Media tools (preserved feature) ===== */}
      <MediaToolsSection />
    </div>
  );
}
