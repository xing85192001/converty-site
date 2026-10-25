import { ChefHat, HeartPulse, Landmark, type LucideIcon, Sigma } from "lucide-react";
import type { BlogCategory } from "./posts";

export interface CategoryStyle {
  icon: LucideIcon;
  label: string;
  gradient: string;
  badge: string;
  ring: string;
  lightBg: string;
}

// All blog categories share the brand-blue accent for a unified, professional
// SaaS look. Categories stay distinguishable by their icon + label, not by color.
const BRAND: Omit<CategoryStyle, "icon" | "label"> = {
  gradient: "from-primary to-[#5b73ff]",
  badge: "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary",
  ring: "ring-primary/20",
  lightBg: "bg-primary/[0.04] dark:bg-primary/[0.06]",
};

export function getCategoryStyle(category: BlogCategory): CategoryStyle {
  switch (category) {
    case "finance":
      return { icon: Landmark, label: "finance", ...BRAND };
    case "health":
      return { icon: HeartPulse, label: "health", ...BRAND };
    case "math":
      return { icon: Sigma, label: "math", ...BRAND };
    case "cooking":
      return { icon: ChefHat, label: "cooking", ...BRAND };
  }
}
