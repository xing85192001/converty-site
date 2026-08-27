import { Palette } from "lucide-react";
import type { ConverterMeta } from "@/types";

export const colorConverters: Record<string, ConverterMeta> = {
  rgb: {
    id: "rgb",
    slug: "rgb",
    category: "color",
    keywords: ["rgb", "hex", "color", "convert", "hsl", "cmyk"],
    icon: Palette,
    featured: true,
  },
};
