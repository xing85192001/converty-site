"use client";

import { Clock, Monitor, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { CalculatorErrorBoundary } from "@/components/error-boundary/calculator-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryById } from "@/lib/registry/categories";
import { getFeatureColorClasses, getToolFeatures } from "@/lib/registry/tool-features";
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
  const category = getCategoryById(categoryId);
  const { coreFeatures, highlights } = getToolFeatures(toolId ?? "", categoryId);

  return (
    <div className="container max-w-5xl py-8">
      <Breadcrumbs categoryId={categoryId} current={title} categoryName={categoryName} />

      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <CalculatorErrorBoundary>{children}</CalculatorErrorBoundary>
        </CardContent>
      </Card>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold tracking-tight">{t("coreFeatures")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map((feature) => (
            <Card
              key={feature.title}
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

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold tracking-tight">{t("toolHighlights")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((highlight, index) => {
            const Icon = highlightIcons[index % highlightIcons.length];
            return (
              <Card key={highlight.title} className="border-0 bg-muted/50">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{highlight.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{highlight.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {infoContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About {title}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            {infoContent}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
