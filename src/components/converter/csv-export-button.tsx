"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type CsvRow, exportToCsv } from "@/lib/utils/csv-export";

interface CsvExportButtonProps {
  data: CsvRow[];
  filename: string; // Base filename (without extension)
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function CsvExportButton({
  data,
  filename,
  variant = "outline",
  size = "sm",
  className,
  disabled = false,
}: CsvExportButtonProps) {
  const t = useTranslations("calculator.export");
  const tToast = useTranslations("common.toast");

  const handleExport = () => {
    try {
      // Generate timestamp for filename
      const timestamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");

      // Compute full filename with timestamp
      const fullFilename = `${filename}_${timestamp}.csv`;

      // Export CSV
      exportToCsv(data, { filename: fullFilename });
      toast.success(tToast("csvExportSuccess"));
    } catch (error) {
      console.error("CSV export failed:", error);
      toast.error(tToast("csvExportError"));
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      className={className}
      disabled={disabled || data.length === 0}
      title={t("csvTooltip")}
    >
      <Download className="h-4 w-4 mr-2" />
      {t("exportCsv")}
    </Button>
  );
}
