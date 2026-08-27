"use client";

import { AlertCircle, Merge } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SupernetInputProps {
  value: string;
  onChange: (value: string) => void;
  onAggregate: () => void;
  error: string | null;
}

/**
 * SupernetInput component
 *
 * Provides input controls for entering multiple networks to aggregate.
 *
 * Features:
 * - Textarea for multi-network input (one per line or comma-separated)
 * - Aggregate button to trigger supernetting operation
 * - Error display below textarea
 * - Instructions and placeholder text
 */
export function SupernetInput({ value, onChange, onAggregate, error }: SupernetInputProps) {
  const t = useTranslations("calculator.subnet.advanced");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="networks-input">{t("networks-label")}</Label>
        <Textarea
          id="networks-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("networks-placeholder")}
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Enter networks one per line, or separated by commas or semicolons
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div>
        <Button onClick={onAggregate} title={t("aggregate-tooltip")}>
          <Merge className="h-4 w-4 mr-2" />
          {t("aggregate")}
        </Button>
      </div>
    </div>
  );
}
