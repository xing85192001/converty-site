import { Network } from "lucide-react";
import type { ConverterMeta } from "@/types";

export const networkConverters: Record<string, ConverterMeta> = {
  // Subnet calculators
  "subnet-calculator": {
    id: "subnet-calculator",
    slug: "subnet-calculator",
    category: "network",
    subcategory: "subnet",
    keywords: ["subnet", "cidr", "ip", "ipv4", "ipv6", "network", "mask", "supernet", "calculator"],
    icon: Network,
    featured: true,
  },

  // CIDR range calculator
  "cidr-range": {
    id: "cidr-range",
    slug: "cidr-range",
    category: "network",
    subcategory: "ip",
    keywords: ["cidr", "range", "ip", "subnet", "contains", "check", "ipv4", "ipv6"],
    icon: Network,
    featured: false,
  },

  // IP address calculator
  "ip-calculator": {
    id: "ip-calculator",
    slug: "ip-calculator",
    category: "network",
    subcategory: "ip",
    keywords: ["ip", "address", "class", "private", "public", "ipv4", "ipv6", "classification"],
    icon: Network,
    featured: false,
  },

  // Throughput calculator
  "throughput-calculator": {
    id: "throughput-calculator",
    slug: "throughput-calculator",
    category: "network",
    subcategory: "performance",
    keywords: [
      "throughput",
      "speed",
      "bandwidth",
      "transfer",
      "rate",
      "mbps",
      "gbps",
      "network",
      "performance",
    ],
    icon: Network,
    featured: false,
  },

  // BB Credit calculator (SAN / Fibre Channel ISL)
  "bb-credit-calculator": {
    id: "bb-credit-calculator",
    slug: "bb-credit-calculator",
    category: "network",
    subcategory: "san",
    keywords: [
      "san",
      "fibre channel",
      "fc",
      "bb credit",
      "buffer",
      "isl",
      "brocade",
      "mds",
      "cisco",
      "longdistance",
      "storage",
      "fos",
      "nxos",
    ],
    icon: Network,
    featured: false,
  },

  // Latency converter
  "latency-converter": {
    id: "latency-converter",
    slug: "latency-converter",
    category: "network",
    subcategory: "performance",
    keywords: [
      "latency",
      "ping",
      "delay",
      "milliseconds",
      "microseconds",
      "nanoseconds",
      "network",
      "time",
      "rtt",
    ],
    icon: Network,
    featured: false,
  },
};
