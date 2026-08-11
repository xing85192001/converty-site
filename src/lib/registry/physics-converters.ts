import { Gauge } from "lucide-react";
import type { ConverterMeta } from "@/types";

export const physicsConverters: Record<string, ConverterMeta> = {
  speed: {
    id: "speed",
    slug: "speed",
    category: "physics",
    keywords: ["speed", "velocity", "mph", "kmh", "meters per second"],
    icon: Gauge,
    featured: true,
  },
};
