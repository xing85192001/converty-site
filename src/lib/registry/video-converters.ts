import { Video } from "lucide-react";
import type { ConverterMeta } from "@/types";

export const videoConverters: Record<string, ConverterMeta> = {
  "video-file-size": {
    id: "video-file-size",
    slug: "video-file-size",
    category: "video",
    keywords: ["video", "file size", "bitrate", "duration", "resolution"],
    icon: Video,
    featured: true,
  },
  "audio-filesize": {
    id: "audio-filesize",
    slug: "audio-filesize",
    category: "video",
    keywords: ["audio", "file size", "mp3", "wav", "flac", "bitrate"],
    icon: Video,
    featured: false,
  },
  "common-bitrates": {
    id: "common-bitrates",
    slug: "common-bitrates",
    category: "video",
    keywords: ["bitrate", "prores", "dnxhd", "dcp", "mpeg", "codec"],
    icon: Video,
    featured: false,
  },
  "dcp-filesize": {
    id: "dcp-filesize",
    slug: "dcp-filesize",
    category: "video",
    keywords: ["dcp", "digital cinema", "file size", "cinema"],
    icon: Video,
    featured: false,
  },
  "foot-lambert": {
    id: "foot-lambert",
    slug: "foot-lambert",
    category: "video",
    keywords: ["foot-lambert", "luminance", "nits", "projection", "cinema"],
    icon: Video,
    featured: false,
  },
  "screen-size": {
    id: "screen-size",
    slug: "screen-size",
    category: "video",
    keywords: ["screen", "diagonal", "width", "height", "aspect ratio"],
    icon: Video,
    featured: false,
  },
  "video-bitrate": {
    id: "video-bitrate",
    slug: "video-bitrate",
    category: "video",
    keywords: ["bitrate", "video", "h264", "h265", "prores", "codec"],
    icon: Video,
    featured: false,
  },
  "frame-rate": {
    id: "frame-rate",
    slug: "frame-rate",
    category: "video",
    keywords: ["frame rate", "fps", "ffmpeg", "convert", "video"],
    icon: Video,
    featured: false,
  },
};
