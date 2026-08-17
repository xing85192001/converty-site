"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export function useCopyToClipboard(timeout = 2000): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("common");

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        toast.success(t("copySuccess"));
      } catch (error) {
        console.error(t("copyError"), error);
        toast.error(t("copyError"));
      }
    },
    [timeout, t]
  );

  return { copied, copy };
}
