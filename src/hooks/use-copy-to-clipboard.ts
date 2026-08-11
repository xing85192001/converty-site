"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export function useCopyToClipboard(timeout = 2000): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        toast.success("Copied to clipboard");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        toast.error("Failed to copy to clipboard");
      }
    },
    [timeout]
  );

  return { copied, copy };
}
