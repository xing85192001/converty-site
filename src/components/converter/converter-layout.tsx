import { CalculatorErrorBoundary } from "@/components/error-boundary/calculator-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/lib/registry/categories";
import { Breadcrumbs } from "./breadcrumbs";

interface ConverterLayoutProps {
  title: string;
  description: string;
  category: Category;
  categoryName?: string; // Translated category name (preferred over category.name)
  children: React.ReactNode;
  infoContent?: React.ReactNode;
}

export function ConverterLayout({
  title,
  description,
  category,
  categoryName,
  children,
  infoContent,
}: ConverterLayoutProps) {
  return (
    <div className="container max-w-4xl py-8">
      <Breadcrumbs category={category} current={title} categoryName={categoryName} />

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <CalculatorErrorBoundary>{children}</CalculatorErrorBoundary>
        </CardContent>
      </Card>

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
