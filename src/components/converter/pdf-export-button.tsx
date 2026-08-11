"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportToPdf, type PdfExportOptions, type PdfSection } from "@/lib/utils/pdf-export";

interface PdfExportButtonProps {
  sections: PdfSection[];
  options: PdfExportOptions;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function PdfExportButton({
  sections,
  options,
  variant = "outline",
  size = "sm",
  className,
  disabled = false,
}: PdfExportButtonProps) {
  const t = useTranslations("calculator.export");
  const tToast = useTranslations("common.toast");

  const handleExport = () => {
    try {
      // Generate timestamp for filename
      const timestamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");

      // Compute base filename
      const baseFilename = options.filename || options.title.toLowerCase().replace(/\s+/g, "-");
      const fullFilename = `${baseFilename}_${timestamp}.pdf`;

      // Export with timestamped filename
      exportToPdf(sections, { ...options, filename: fullFilename });
      toast.success(tToast("pdfExportSuccess"));
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error(tToast("pdfExportError"));
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      className={className}
      disabled={disabled || sections.length === 0}
      title={t("pdfTooltip")}
    >
      <FileText className="h-4 w-4 mr-2" />
      {t("exportPdf")}
    </Button>
  );
}
