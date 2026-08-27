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

export function getCategoryStyle(category: BlogCategory): CategoryStyle {
  switch (category) {
    case "finance":
      return {
        icon: Landmark,
        label: "finance",
        gradient: "from-emerald-500 to-teal-600",
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        ring: "ring-emerald-500/20",
        lightBg: "bg-emerald-50/50 dark:bg-emerald-950/30",
      };
    case "health":
      return {
        icon: HeartPulse,
        label: "health",
        gradient: "from-rose-500 to-pink-600",
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
        ring: "ring-rose-500/20",
        lightBg: "bg-rose-50/50 dark:bg-rose-950/30",
      };
    case "math":
      return {
        icon: Sigma,
        label: "math",
        gradient: "from-blue-500 to-indigo-600",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        ring: "ring-blue-500/20",
        lightBg: "bg-blue-50/50 dark:bg-blue-950/30",
      };
    case "cooking":
      return {
        icon: ChefHat,
        label: "cooking",
        gradient: "from-amber-500 to-orange-600",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        ring: "ring-amber-500/20",
        lightBg: "bg-amber-50/50 dark:bg-amber-950/30",
      };
  }
}
