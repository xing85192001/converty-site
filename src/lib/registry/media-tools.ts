import {
  ArrowRight,
  Database,
  ImageIcon,
  LayoutGrid,
  type LucideIcon,
  Sparkles,
  Video,
  Wand2,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import { IcoConverter } from "@/components/media-tools/ico-converter";
import { ImageCompressor } from "@/components/media-tools/image-compressor";
import { ImageFormatConverter } from "@/components/media-tools/image-format-converter";
import { ImageToPdf } from "@/components/media-tools/image-to-pdf";
import { ImageUpscaler } from "@/components/media-tools/image-upscaler";
import { ImageWatermarkRemover } from "@/components/media-tools/image-watermark-remover";
import { VideoCompressor } from "@/components/media-tools/video-compressor";
import { VideoToGif } from "@/components/media-tools/video-to-gif";
import { VideoWatermarkRemover } from "@/components/video-watermark-remover";

export type MediaCategory = "all" | "watermark" | "format" | "icon" | "compress";

export interface MediaToolMeta {
  id: string;
  /** URL segment used at /tools/[slug] */
  slug: string;
  /** Full i18n key under the `mediaTools` namespace, e.g. "videoWatermark.title" */
  titleKey: string;
  /** Full i18n key under the `mediaTools` namespace, e.g. "videoWatermark.desc" */
  descKey: string;
  /** Full i18n key under the `mediaTools` namespace for the A-layer guide, e.g. "videoWatermark.guide" */
  guideKey: string;
  icon: LucideIcon;
  /** Homepage tab categories this tool belongs to */
  categories: MediaCategory[];
}

export const mediaTools: MediaToolMeta[] = [
  {
    id: "video-watermark",
    slug: "video-watermark",
    titleKey: "videoWatermark.title",
    descKey: "videoWatermark.desc",
    guideKey: "videoWatermark.guide",
    icon: Video,
    categories: ["watermark"],
  },
  {
    id: "image-watermark",
    slug: "image-watermark",
    titleKey: "imageWatermark.title",
    descKey: "imageWatermark.desc",
    guideKey: "imageWatermark.guide",
    icon: Sparkles,
    categories: ["watermark"],
  },
  {
    id: "ico",
    slug: "ico-converter",
    titleKey: "ico.title",
    descKey: "ico.desc",
    guideKey: "ico.guide",
    icon: ImageIcon,
    categories: ["icon"],
  },
  {
    id: "format-convert",
    slug: "image-format-converter",
    titleKey: "formatConvert.title",
    descKey: "formatConvert.desc",
    guideKey: "formatConvert.guide",
    icon: LayoutGrid,
    categories: ["format"],
  },
  {
    id: "image-compress",
    slug: "image-compress",
    titleKey: "imageCompress.title",
    descKey: "imageCompress.desc",
    guideKey: "imageCompress.guide",
    icon: Database,
    categories: ["compress"],
  },
  {
    id: "video-compress",
    slug: "video-compress",
    titleKey: "videoCompress.title",
    descKey: "videoCompress.desc",
    guideKey: "videoCompress.guide",
    icon: Zap,
    categories: ["compress"],
  },
  {
    id: "image-upscale",
    slug: "image-upscale",
    titleKey: "imageUpscale.title",
    descKey: "imageUpscale.desc",
    guideKey: "imageUpscale.guide",
    icon: Wand2,
    categories: ["format"],
  },
  {
    id: "image-to-pdf",
    slug: "image-to-pdf",
    titleKey: "imageToPdf.title",
    descKey: "imageToPdf.desc",
    guideKey: "imageToPdf.guide",
    icon: ArrowRight,
    categories: ["format"],
  },
  {
    id: "video-to-gif",
    slug: "video-to-gif",
    titleKey: "videoToGif.title",
    descKey: "videoToGif.desc",
    guideKey: "videoToGif.guide",
    icon: Video,
    categories: ["format"],
  },
];

export const mediaToolComponents: Record<string, ComponentType> = {
  "video-watermark": VideoWatermarkRemover,
  "image-watermark": ImageWatermarkRemover,
  "ico-converter": IcoConverter,
  "image-format-converter": ImageFormatConverter,
  "image-compress": ImageCompressor,
  "video-compress": VideoCompressor,
  "image-upscale": ImageUpscaler,
  "image-to-pdf": ImageToPdf,
  "video-to-gif": VideoToGif,
};

export function getMediaToolBySlug(slug: string): MediaToolMeta | undefined {
  return mediaTools.find((tool) => tool.slug === slug);
}
