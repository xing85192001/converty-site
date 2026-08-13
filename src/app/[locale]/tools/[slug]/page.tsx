import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getMediaToolBySlug, mediaToolComponents, mediaTools } from "@/lib/registry/media-tools";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => mediaTools.map((tool) => ({ locale, slug: tool.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getMediaToolBySlug(slug);
  if (!tool) return {};
  const t = await getTranslations({ locale, namespace: "mediaTools" });
  return {
    title: t(tool.titleKey),
    description: t(tool.descKey),
  };
}

export default async function MediaToolPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tool = getMediaToolBySlug(slug);
  if (!tool) notFound();

  const ToolComponent = mediaToolComponents[slug];
  if (!ToolComponent) notFound();

  const t = await getTranslations("mediaTools");

  return (
    <div className="container py-6">
      <Link
        href="/all"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("sectionTitle")}
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">{t(tool.titleKey)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t(tool.descKey)}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card/50 p-5">
        <ToolComponent />
      </div>
    </div>
  );
}
