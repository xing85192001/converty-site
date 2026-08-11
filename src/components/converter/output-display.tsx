"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OutputDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
  copyable?: boolean;
  size?: "default" | "lg";
}

export function OutputDisplay({
  label,
  value,
  unit,
  className,
  copyable = true,
  size = "default",
}: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <div
          className={cn("flex-1 rounded-md border bg-muted/50 px-3 py-2", size === "lg" && "py-4")}
        >
          <span
            className={cn(
              "font-mono",
              size === "default" && "text-lg",
              size === "lg" && "text-2xl font-bold"
            )}
          >
            {value}
          </span>
          {unit && <span className="ml-2 text-muted-foreground text-sm">{unit}</span>}
        </div>
        {copyable && (
          <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy value</span>
          </Button>
        )}
      </div>
    </div>
  );
}
