export interface BitrateInfo {
  name: string;
  category: string;
  bitrateMbps: number;
  resolution?: string;
  description: string;
}

export const COMMON_BITRATES: BitrateInfo[] = [
  // ProRes
  {
    name: "ProRes 422 Proxy",
    category: "ProRes",
    bitrateMbps: 45,
    resolution: "1080p",
    description: "Offline editing",
  },
  {
    name: "ProRes 422 LT",
    category: "ProRes",
    bitrateMbps: 102,
    resolution: "1080p",
    description: "Light compression",
  },
  {
    name: "ProRes 422",
    category: "ProRes",
    bitrateMbps: 147,
    resolution: "1080p",
    description: "Standard quality",
  },
  {
    name: "ProRes 422 HQ",
    category: "ProRes",
    bitrateMbps: 220,
    resolution: "1080p",
    description: "High quality",
  },
  {
    name: "ProRes 4444",
    category: "ProRes",
    bitrateMbps: 330,
    resolution: "1080p",
    description: "With alpha channel",
  },
  {
    name: "ProRes 4444 XQ",
    category: "ProRes",
    bitrateMbps: 500,
    resolution: "1080p",
    description: "Highest quality",
  },

  // DNxHD/DNxHR
  {
    name: "DNxHD 36",
    category: "DNxHD",
    bitrateMbps: 36,
    resolution: "1080p",
    description: "Offline quality",
  },
  {
    name: "DNxHD 145",
    category: "DNxHD",
    bitrateMbps: 145,
    resolution: "1080p",
    description: "Standard quality",
  },
  {
    name: "DNxHD 220",
    category: "DNxHD",
    bitrateMbps: 220,
    resolution: "1080p",
    description: "High quality",
  },
  {
    name: "DNxHR LB",
    category: "DNxHR",
    bitrateMbps: 80,
    resolution: "4K",
    description: "Low bandwidth",
  },
  {
    name: "DNxHR SQ",
    category: "DNxHR",
    bitrateMbps: 150,
    resolution: "4K",
    description: "Standard quality",
  },
  {
    name: "DNxHR HQ",
    category: "DNxHR",
    bitrateMbps: 220,
    resolution: "4K",
    description: "High quality",
  },

  // DV
  { name: "DV25", category: "DV", bitrateMbps: 25, resolution: "SD", description: "Standard DV" },
  {
    name: "DVCPRO50",
    category: "DV",
    bitrateMbps: 50,
    resolution: "SD",
    description: "Professional DV",
  },
  {
    name: "DVCPRO HD",
    category: "DV",
    bitrateMbps: 100,
    resolution: "1080i",
    description: "HD variant",
  },

  // DCP (Digital Cinema Package)
  { name: "DCP 2K", category: "DCP", bitrateMbps: 250, resolution: "2K", description: "Cinema 2K" },
  { name: "DCP 4K", category: "DCP", bitrateMbps: 500, resolution: "4K", description: "Cinema 4K" },

  // MPEG/H.264/H.265
  {
    name: "DVD MPEG-2",
    category: "MPEG",
    bitrateMbps: 8,
    resolution: "SD",
    description: "DVD standard",
  },
  {
    name: "Blu-ray Max",
    category: "MPEG",
    bitrateMbps: 40,
    resolution: "1080p",
    description: "Blu-ray maximum",
  },
  {
    name: "H.264 Web SD",
    category: "H.264",
    bitrateMbps: 2,
    resolution: "480p",
    description: "Web streaming SD",
  },
  {
    name: "H.264 Web HD",
    category: "H.264",
    bitrateMbps: 5,
    resolution: "720p",
    description: "Web streaming HD",
  },
  {
    name: "H.264 Web FHD",
    category: "H.264",
    bitrateMbps: 8,
    resolution: "1080p",
    description: "Web streaming FHD",
  },
  {
    name: "H.264 4K",
    category: "H.264",
    bitrateMbps: 35,
    resolution: "4K",
    description: "4K streaming",
  },
  {
    name: "H.265 4K HDR",
    category: "H.265",
    bitrateMbps: 25,
    resolution: "4K",
    description: "4K HDR efficient",
  },

  // Streaming platforms
  {
    name: "YouTube 1080p",
    category: "Streaming",
    bitrateMbps: 8,
    resolution: "1080p",
    description: "YouTube recommended",
  },
  {
    name: "YouTube 4K",
    category: "Streaming",
    bitrateMbps: 35,
    resolution: "4K",
    description: "YouTube 4K",
  },
  {
    name: "Netflix 4K",
    category: "Streaming",
    bitrateMbps: 16,
    resolution: "4K",
    description: "Netflix 4K HDR",
  },
  {
    name: "Twitch 1080p60",
    category: "Streaming",
    bitrateMbps: 6,
    resolution: "1080p60",
    description: "Twitch max",
  },
];

export function getBitratesByCategory(category: string): BitrateInfo[] {
  return COMMON_BITRATES.filter((b) => b.category === category);
}

export function getCategories(): string[] {
  return [...new Set(COMMON_BITRATES.map((b) => b.category))];
}
