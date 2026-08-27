import { Database, Network } from "lucide-react";
import type { ConverterMeta } from "@/types";

export const dataConverters: Record<string, ConverterMeta> = {
  // Storage
  "data-size": {
    id: "data-size",
    slug: "data-size",
    category: "data",
    subcategory: "storage",
    keywords: ["data", "size", "bytes", "kilobytes", "megabytes", "gigabytes"],
    icon: Database,
    featured: true,
  },
  bandwidth: {
    id: "bandwidth",
    slug: "bandwidth",
    category: "data",
    subcategory: "network",
    keywords: ["bandwidth", "mbps", "kbps", "network", "speed", "transfer"],
    icon: Database,
    featured: false,
  },
  "download-calculator": {
    id: "download-calculator",
    slug: "download-calculator",
    category: "data",
    subcategory: "network",
    keywords: ["download", "time", "bandwidth", "file size", "transfer"],
    icon: Database,
    featured: false,
  },

  // Network
  "tcp-throughput": {
    id: "tcp-throughput",
    slug: "tcp-throughput",
    category: "data",
    subcategory: "network",
    keywords: ["tcp", "throughput", "network", "bandwidth", "mathis", "mss", "rtt", "packet loss"],
    icon: Network,
    featured: false,
  },
  "bandwidth-delay-product": {
    id: "bandwidth-delay-product",
    slug: "bandwidth-delay-product",
    category: "data",
    subcategory: "network",
    keywords: ["bandwidth", "delay", "product", "bdp", "tcp", "buffer", "window size"],
    icon: Network,
    featured: false,
  },
};
