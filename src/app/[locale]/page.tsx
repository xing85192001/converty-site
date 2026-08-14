import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaToolsSection } from "@/components/media-tools-section";
import { HeroSearch } from "@/components/search/hero-search";
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
        className="group relative block rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
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
      {/* ===== Hero (compact) ===== */}
      <section className="py-6 text-center">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t("siteName")} <span className="text-primary">{t("homepageTitle")}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("tagline")}</p>

          <div className="mx-auto mt-4 max-w-xl">
            <HeroSearch />
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {hotChipCategories.map((id) => (
              <Link
                key={id}
                href={`/${getCategoryById(id)?.slug}`}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {nav(`${id}.name`)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Media tools (preserved feature) ===== */}
      <MediaToolsSection />

      {/* ===== Quick Tools ===== */}
      <section className="pb-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold">{t("quickTools")}</h2>
          <Link href="/all" className="text-sm font-medium text-primary hover:underline">
            {t("homepageViewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {quickTools.map(renderQuickCard)}
        </div>
      </section>

      {/* ===== Browse by Category (tabs) ===== */}
      <section className="pb-8">
        <h2 className="mb-3 text-lg font-bold">{t("allCategories")}</h2>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <c.icon className="h-4 w-4" />
              {nav(`${c.id}.name`)}
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Hot Tools (preserved) ===== */}
      <section className="pb-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold">{t("hotTools")}</h2>
          <Link href="/all" className="text-sm font-medium text-primary hover:underline">
            {t("homepageViewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Object.values(converterRegistry)
            .filter((c) => c.featured)
            .slice(0, 8)
            .map((converter) => {
              const Icon = converter.icon;
              return (
                <Link
                  key={converter.id}
                  href={`/${getCategoryById(converter.category)?.slug}/${converter.slug}`}
                  className="group block rounded-xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-primary"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-2 font-semibold">{tc(`${converter.id}.name`)}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {tc(`${converter.id}.description`)}
                  </p>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
