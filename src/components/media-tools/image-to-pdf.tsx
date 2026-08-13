"use client";

import { jsPDF } from "jspdf";
import { Download, FileText, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDropZone, formatBytes, ToolError } from "./shared";

export function ImageToPdf() {
  const t = useTranslations("mediaTools.imageToPdf");
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function process() {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < files.length; i++) {
        if (i > 0) pdf.addPage();
        const file = files[i];
        const dataUrl = await fileToJpegDataUrl(file);
        const img = await loadImage(dataUrl);
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const pageRatio = pageWidth / pageHeight;
        let drawW = pageWidth;
        let drawH = pageHeight;
        if (imgRatio > pageRatio) {
          drawH = pageWidth / imgRatio;
        } else {
          drawW = pageHeight * imgRatio;
        }
        const x = (pageWidth - drawW) / 2;
        const y = (pageHeight - drawH) / 2;
        pdf.addImage(dataUrl, "JPEG", x, y, drawW, drawH);
      }

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pdfError"));
    } finally {
      setProcessing(false);
    }
  }

  function download() {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `images-${Date.now()}.pdf`;
    a.click();
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setDownloadUrl(null);
  }

  return (
    <div className="space-y-4">
      <ToolError message={error} />
      <FileDropZone
        accept="image/*"
        multiple
        onFiles={(newFiles) => {
          setFiles((prev) => [...prev, ...newFiles]);
          setDownloadUrl(null);
        }}
      />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <Button
          onClick={process}
          disabled={processing}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
        >
          {processing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          {t("mergeBtn")}
        </Button>
      )}
      {downloadUrl && (
        <Button onClick={download} className="w-full rounded-xl">
          <Download className="mr-2 h-4 w-4" /> {t("downloadBtn")}
        </Button>
      )}
    </div>
  );
}

function fileToJpegDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = () => reject(new Error("load"));
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load"));
  });
}
