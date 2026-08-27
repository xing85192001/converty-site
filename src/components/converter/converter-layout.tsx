"use client";

import { Clock, Monitor, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AdUnit } from "@/components/ads/ad-unit";
import { Disclaimer } from "@/components/ads/disclaimer";
import { CalculatorErrorBoundary } from "@/components/error-boundary/calculator-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getCategoryById } from "@/lib/registry/categories";
import { getConvertersByCategory } from "@/lib/registry/converters";
import { getFeatureColorClasses, getToolFeaturesLayout } from "@/lib/registry/tool-features";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";

interface ConverterLayoutProps {
  title: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  children: React.ReactNode;
  infoContent?: React.ReactNode;
  toolId?: string;
}

const highlightIcons = [Zap, Monitor, Clock];

export function ConverterLayout({
  title,
  description,
  categoryId,
  categoryName,
  children,
  infoContent,
  toolId,
}: ConverterLayoutProps) {
  const t = useTranslations("common");
  const tc = useTranslations("converter");
  const tf = useTranslations("toolFeatures");
  const locale = useLocale();
  const category = getCategoryById(categoryId);
  const layout = getToolFeaturesLayout(toolId ?? "", categoryId);
  const coreFeatures = layout.coreFeatures.map((f) => ({
    ...f,
    title: tf(`core.${f.titleKey}.title`),
    description: tf(`core.${f.titleKey}.description`),
  }));
  const highlights = layout.highlights.map((h) => ({
    ...h,
    title: tf(`highlights.${h.titleKey}.title`),
    description: tf(`highlights.${h.titleKey}.description`),
  }));

  const categorySlug = category?.slug ?? categoryId;
  const related = getConvertersByCategory(categoryId)
    .filter((c) => c.id !== toolId)
    .slice(0, 4);

  // JSON-LD WebApplication schema (reserved SEO slot)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    url: `https://baikecalc.com/${locale}/${categorySlug}/${toolId ?? ""}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* JSON-LD WebApplication structured data (static, server-rendered) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs categoryId={categoryId} current={title} categoryName={categoryName} />

      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Disclaimer categoryId={categoryId} />

      <Card className="mb-6 border-border shadow-card">
        <CardContent className="pt-6">
          <CalculatorErrorBoundary>{children}</CalculatorErrorBoundary>
        </CardContent>
      </Card>

      <AdUnit slot="content-top" />

      {coreFeatures.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold tracking-tight">{t("coreFeatures")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {coreFeatures.map((feature) => (
              <Card
                key={feature.titleKey}
                className={cn("border", getFeatureColorClasses(feature.color))}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm opacity-90">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {highlights.length > 0 && (
        <>
          <AdUnit slot="content-mid" />
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold tracking-tight">{t("toolHighlights")}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((highlight, index) => {
                const Icon = highlightIcons[index % highlightIcons.length];
                return (
                  <Card key={highlight.titleKey} className="border-border bg-muted/40">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{highlight.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {highlight.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </>
      )}

      {infoContent && (
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="text-lg">{t("aboutThisCalculator", { title })}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            {infoContent}
          </CardContent>
        </Card>
      )}

      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold tracking-tight">{t("navigation.moreTools")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={`/${categorySlug}/${tool.slug}`}
                  className="card-hover group rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-semibold">{tc(`${tool.id}.name`)}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {tc(`${tool.id}.description`)}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <AdUnit slot="content-bottom" />
    </div>
  );
}
