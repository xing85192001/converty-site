import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { MediaToolsSection } from "@/components/media-tools-section";
import { locales } from "@/i18n/config";
import { categories, getCategoryById } from "@/lib/registry/categories";
import { converterRegistry } from "@/lib/registry/converters";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// 设计稿首页重点展示的工具 ID
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

  const hotTools = hotToolIds
    .map((id) => converterRegistry[id])
    .filter(Boolean);

  const colorHealthTools = colorHealthToolIds
    .map((id) => converterRegistry[id])
    .filter(Boolean);

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
      <Link key={converter.id} href={`/${getCategoryById(converter.category)?.slug}/${converter.slug}`}>
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
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        </div>
      </Link>
    );
  };

  const renderSectionTitle = (title: string, subtitle: string, href?: string) => (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        {title} <small className="text-sm font-normal text-muted-foreground">{subtitle}</small>
      </h2>
      {href && (
        <Link href={href} className="text-sm text-primary transition-opacity hover:opacity-80">
          查看全部 →
        </Link>
      )}
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      {/* 背景装饰 */}
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
            <span className="text-foreground">免费在线工具箱</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground sm:text-sm">
            {t("tagline")}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Button asChild className="h-9 rounded-xl bg-gradient-to-r from-primary to-cyan-400 px-5 text-sm text-primary-foreground hover:opacity-90">
              <Link href="/all">浏览全部工具</Link>
            </Button>
            <Button asChild variant="outline" className="h-9 rounded-xl border-white/10 bg-white/5 px-5 text-sm hover:bg-white/10">
              <Link href="/blog">查看博客</Link>
            </Button>
          </div>
        </section>

        {/* ===== 图片 / 视频处理（真实可用） ===== */}
        <MediaToolsSection />

        {/* ===== 热门工具 ===== */}
        {renderSectionTitle("🔥 热门工具", "Hot Tools", "/all")}
        <div className="mb-3 flex flex-wrap gap-2">
          {["全部", "基础计算", "单位换算", "百分比", "日期时间"].map((chip, i) => (
            <span
              key={chip}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
                i === 0
                  ? "bg-primary/15 text-primary"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hotTools.map((tool) => renderCard(tool, "cyan"))}
        </div>

        {/* ===== 颜色 & 健康工具 ===== */}
        <section className="mt-14">
          {renderSectionTitle("🎨 颜色 & 健康工具", "Color & Health Tools")}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colorHealthTools.map((tool, idx) => renderCard(tool, idx === 0 ? "purple" : "green"))}
          </div>
        </section>

        {/* ===== 全部工具分类（保留原有导航入口） ===== */}
        <section className="mt-16">
          {renderSectionTitle("📂 全部工具分类", "All Categories", "/all")}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/${category.slug}`}>
                <div className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                      {nav(`${category.id}.name`)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{nav(`${category.id}.description`)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
