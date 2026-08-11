import { Music } from "lucide-react";
import type { ConverterMeta } from "@/types";

export const musicConverters: Record<string, ConverterMeta> = {
  bpm: {
    id: "bpm",
    slug: "bpm",
    category: "music",
    keywords: ["bpm", "tempo", "beats per minute", "music", "rhythm"],
    icon: Music,
    featured: true,
  },
};
