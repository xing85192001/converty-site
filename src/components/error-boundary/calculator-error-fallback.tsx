"use client";

import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CalculatorErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="pt-6 space-y-4">
        <p className="text-destructive font-semibold">Something went wrong</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Reload Calculator
        </Button>
      </CardContent>
    </Card>
  );
}
