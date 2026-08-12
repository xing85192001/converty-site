"use client";

import { useState, useRef } from "react";
import {
  ArrowRight,
  Database,
  ImageIcon,
  LayoutGrid,
  Sparkles,
  Video,
  Wand2,
  Zap,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoWatermarkRemover } from "@/components/video-watermark-remover";
import { ImageWatermarkRemover } from "./media-tools/image-watermark-remover";
import { IcoConverter } from "./media-tools/ico-converter";
import { ImageFormatConverter } from "./media-tools/image-format-converter";
import { ImageCompressor } from "./media-tools/image-compressor";
import { VideoCompressor } from "./media-tools/video-compressor";
import { ImageUpscaler } from "./media-tools/image-upscaler";
import { ImageToPdf } from "./media-tools/image-to-pdf";

type ToolId =
  | "video-watermark"
  | "image-watermark"
  | "ico"
  | "format-convert"
  | "image-compress"
  | "video-compress"
  | "image-upscale"
  | "image-to-pdf";

type Category = "全部" | "去水印" | "格式转换" | "图标工具" | "压缩优化";

interface MediaTool {
  id: ToolId;
  icon: LucideIcon;
  title: string;
  desc: string;
  categories: Category[];
}

const mediaTools: MediaTool[] = [
  {
    id: "video-watermark",
    icon: Video,
    title: "视频去水印",
    desc: "上传视频，框选水印区域，浏览器内 AI 处理，支持 MP4 / MOV / WebM。",
    categories: ["去水印"],
  },
  {
    id: "image-watermark",
    icon: Sparkles,
    title: "图片去水印",
    desc: "框选水印区域，AI 智能消除，支持 JPG / PNG / WEBP。",
    categories: ["去水印"],
  },
  {
    id: "ico",
    icon: ImageIcon,
    title: "ICO 图标转换",
    desc: "图片转 .ico，支持多尺寸打包（16/32/64/128/256px）。",
    categories: ["图标工具"],
  },
  {
    id: "format-convert",
    icon: LayoutGrid,
    title: "图片格式转换",
    desc: "PNG / JPG / WEBP / BMP / GIF 互转。",
    categories: ["格式转换"],
  },
  {
    id: "image-compress",
    icon: Database,
    title: "图片压缩",
    desc: "有损 / 无损压缩，减小体积保留画质。",
    categories: ["压缩优化"],
  },
  {
    id: "video-compress",
    icon: Zap,
    title: "视频压缩",
    desc: "调整分辨率与码率，快速压缩视频体积。",
    categories: ["压缩优化"],
  },
  {
    id: "image-upscale",
    icon: Wand2,
    title: "图片放大",
    desc: "AI 超分辨率，模糊图片变清晰。",
    categories: ["格式转换"],
  },
  {
    id: "image-to-pdf",
    icon: ArrowRight,
    title: "图片转 PDF",
    desc: "多张图片合并转换为 PDF 文件。",
    categories: ["格式转换"],
  },
];

const categories: Category[] = ["全部", "去水印", "格式转换", "图标工具", "压缩优化"];

const toolComponents: Record<ToolId, React.ComponentType> = {
  "video-watermark": VideoWatermarkRemover,
  "image-watermark": ImageWatermarkRemover,
  ico: IcoConverter,
  "format-convert": ImageFormatConverter,
  "image-compress": ImageCompressor,
  "video-compress": VideoCompressor,
  "image-upscale": ImageUpscaler,
  "image-to-pdf": ImageToPdf,
};

export function MediaToolsSection() {
  const [activeCategory, setActiveCategory] = useState<Category>("全部");
  const [activeTool, setActiveTool] = useState<ToolId>("video-watermark");
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredTools =
    activeCategory === "全部"
      ? mediaTools
      : mediaTools.filter((t) => t.categories.includes(activeCategory));

  const activeToolMeta = mediaTools.find((t) => t.id === activeTool);

  function selectTool(id: ToolId) {
    setActiveTool(id);
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }

  const ActiveComponent = toolComponents[activeTool];

  return (
    <section className="mb-3">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          🖼️ 图片 / 视频处理 <small className="text-sm font-normal text-muted-foreground">Image & Video Tools · 新增</small>
        </h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setActiveCategory(chip)}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === chip
                ? "bg-pink-500/15 text-pink-400"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => selectTool(tool.id)}
              className={cn(
                "group relative rounded-2xl border border-white/10 bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
                isActive && "border-pink-500/50 ring-1 ring-pink-500/30"
              )}
            >
              <span className="absolute right-4 top-4 rounded-full border border-pink-500/30 bg-pink-500/15 px-2 py-0.5 text-[10px] font-semibold text-pink-300">
                NEW
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-pink-500/10 text-pink-400 transition-colors group-hover:bg-pink-500 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{tool.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      <div ref={previewRef} className="mt-14">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            ✨ 特色工具预览{" "}
            <small className="text-sm font-normal text-muted-foreground">
              {activeToolMeta ? `· ${activeToolMeta.title}` : "Featured Tool Preview"}
            </small>
          </h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card/50 p-5">
          <ActiveComponent />
        </div>
      </div>
    </section>
  );
}
