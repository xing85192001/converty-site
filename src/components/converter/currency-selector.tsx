"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SupportedCurrency = "CHF" | "EUR";

interface CurrencySelectorProps {
  value: SupportedCurrency;
  onChange: (currency: SupportedCurrency) => void;
  id?: string;
  label?: string;
  showLabel?: boolean;
}

const CURRENCIES: { id: SupportedCurrency; name: string; symbol: string }[] = [
  { id: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { id: "EUR", name: "Euro", symbol: "EUR" },
];

export function CurrencySelector({
  value,
  onChange,
  id = "currency",
  label,
  showLabel = true,
}: CurrencySelectorProps) {
  const t = useTranslations("calculator.realestate");

  return (
    <div className="space-y-2">
      {showLabel && <Label htmlFor={id}>{label || t("currency")}</Label>}
      <Select value={value} onValueChange={(v) => onChange(v as SupportedCurrency)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency.id} value={currency.id}>
              {currency.symbol} - {currency.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Format currency value according to Swiss/European conventions
 */
export function formatCurrencyValue(
  value: number,
  currency: SupportedCurrency,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const minDigits = options?.minimumFractionDigits ?? 0;
  const maxDigits = options?.maximumFractionDigits ?? 0;

  if (currency === "CHF") {
    // Swiss formatting: CHF 1'234'567.89
    return `CHF ${value.toLocaleString("de-CH", {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    })}`;
  }

  // Euro formatting: EUR 1,234,567.89
  return `EUR ${value.toLocaleString("de-DE", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  })}`;
}
