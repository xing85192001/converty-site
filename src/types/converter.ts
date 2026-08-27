import type { LucideIcon } from "lucide-react";

export interface ConverterMeta {
  id: string;
  slug: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  icon: LucideIcon;
  featured?: boolean;
}

export interface CalculationStep {
  label: string;
  value: string | number;
}
