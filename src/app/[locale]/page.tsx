import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaToolsSection } from "@/components/media-tools-section";
import { Button } from "@/components/ui/button";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { categories, getCategoryById } from "@/lib/registry/categories";
import { converterRegistry } from "@/lib/registry/converters";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const hotToolIds = [
  "basic-calculator",
  "programmer-calculator",
  "unit-converter",
  "percentage-calculator",
  "time-duration",
  "duration-converter",
  "currency",
  "area-calculator",
];

const colorHealthToolIds = ["rgb", "ideal-weight", "body-fat", "sleep-calculator"];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const nav = await getTranslations("nav");
  const tc = await getTranslations("converter");

  const hotTools = hotToolIds.map((id) => converterRegistry[id]).filter(Boolean);

  const colorHealthTools = colorHealthToolIds.map((id) => converterRegistry[id]).filter(Boolean);

  const renderCard = (
    converter: { id: string; slug: string; icon: React.ElementType; category: string },
    accent: "cyan" | "purple" | "pink" | "green" = "cyan",
    tag?: string
  ) => {
    const name = tc(`${converter.id}.name`);
    const desc = tc(`${converter.id}.description`);
    const Icon = converter.icon;

    const accentMap = {
      cyan: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
      purple: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white",
      pink: "bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white",
      green: "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white",
    };

    return (
      <Link
        key={converter.id}
        href={`/${getCategoryById(converter.category)?.slug}/${converter.slug}`}
      >
        <div className="group relative rounded-2xl border border-white/10 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          {tag && (
            <span className="absolute right-4 top-4 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              {tag}
            </span>
          )}
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 transition-colors",
              accentMap[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-[15px] font-semibold">{name}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {desc}
          </p>
        </div>
      </Link>
    );
  };

  const renderSectionTitle = (title: string, href?: string) => (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="flex items-center gap-2 text-xl font-bold">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-primary transition-opacity hover:opacity-80">
          {t("homepageViewAll")}
        </Link>
      )}
    </div>
  );

  const hotChipKeys = ["all", "basic", "unit", "percentage", "datetime"] as const;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
        <div className="absolute -right-20 top-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-brand-green/5 blur-[100px]" />
      </div>

      <div className="container py-4 sm:py-5">
        {/* ===== Hero ===== */}
        <section className="relative mb-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/80 to-card/40 px-4 py-3 text-center sm:py-4">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[48px] sm:h-40 sm:w-40" />
          </div>
          <h1 className="mx-auto max-w-3xl text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
            <span className="bg-gradient-to-r from-primary via-cyan-300 to-purple-400 bg-clip-text">
              {t("siteName")}
            </span>
            <br />
            <span className="text-foreground">{t("homepageTitle")}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground sm:text-sm">
            {t("tagline")}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Button
              asChild
              className="h-9 rounded-xl bg-gradient-to-r from-primary to-cyan-400 px-5 text-sm text-primary-foreground hover:opacity-90"
            >
              <Link href="/all">{t("homepageBrowseAll")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-xl border-white/10 bg-white/5 px-5 text-sm hover:bg-white/10"
            >
              <Link href="/blog">{t("homepageViewBlog")}</Link>
            </Button>
          </div>
        </section>

        {/* ===== Image / Video Processing ===== */}
        <MediaToolsSection />

        {/* ===== Hot Tools ===== */}
        {renderSectionTitle(t("hotTools"), "/all")}
        <div className="mb-3 flex flex-wrap gap-2">
          {hotChipKeys.map((key, i) => (
            <span
              key={key}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
                i === 0
                  ? "bg-primary/15 text-primary"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
            >
              {t(`hotToolsChips.${key}`)}
            </span>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hotTools.map((tool) => renderCard(tool, "cyan"))}
        </div>

        {/* ===== Color & Health Tools ===== */}
        <section className="mt-14">
          {renderSectionTitle(t("colorHealthTools"))}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colorHealthTools.map((tool, idx) => renderCard(tool, idx === 0 ? "purple" : "green"))}
          </div>
        </section>

        {/* ===== Browse by category (compact) ===== */}
        <section className="mt-16">
          {renderSectionTitle(t("allCategories"), "/all")}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="rounded-full border border-white/10 bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {nav(`${category.id}.name`)}
              </Link>
            ))}
            <Link
              href="/all"
              className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {t("allTools")} ›
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
