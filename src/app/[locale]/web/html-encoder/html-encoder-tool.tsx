"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  decodeHTML,
  type EncodingMode,
  encodeHTML,
  encodeHTMLAdvanced,
} from "@/lib/converters/web/html-encoder";

export function HTMLEncoderTool() {
  const tSections = useTranslations("calculator.sections");
  const tCommon = useTranslations("common");
  const [input, setInput] = useState("<script>alert('Hello & Goodbye')</script>");
  const [mode, setMode] = useState<EncodingMode>("minimal");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");

  const result =
    direction === "encode" ? encodeHTMLAdvanced(input, mode) : decodeHTML(input).decoded;

  const stats = direction === "encode" ? encodeHTML(input, mode === "full") : decodeHTML(input);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "encode" | "decode")}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
        </div>
        {direction === "encode" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Encoding Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as EncodingMode)}
              className="w-full h-10 px-3 rounded-md border bg-background"
            >
              <option value="minimal">Minimal (& &lt; &gt; &quot; only)</option>
              <option value="full">Full (all special characters)</option>
              <option value="numeric">Numeric (&#xxx; format)</option>
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{tSections("input")}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 rounded-md border bg-background font-mono text-sm"
          placeholder={tSections("input")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 rounded-lg border bg-muted/50">
          <p className="text-sm text-muted-foreground">Characters Converted</p>
          <p className="text-xl font-semibold">{stats.charactersConverted}</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50">
          <p className="text-sm text-muted-foreground">Entities</p>
          <p className="text-xl font-semibold">{stats.entityCount}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{tSections("output")}</label>
          <button
            onClick={() => {
              navigator.clipboard
                .writeText(result)
                .then(() => {
                  toast.success("Copied to clipboard");
                })
                .catch((error) => {
                  console.error("Failed to copy to clipboard:", error);
                  toast.error("Failed to copy to clipboard");
                });
            }}
            className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
          >
            {tCommon("copy")}
          </button>
        </div>
        <textarea
          value={result}
          readOnly
          rows={5}
          className="w-full px-3 py-2 rounded-md border bg-muted/50 font-mono text-sm"
        />
      </div>

      <div className="p-4 rounded-lg border bg-muted/50">
        <p className="text-sm font-medium mb-2">Common HTML Entities</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm font-mono">
          <div>&amp; → &amp;amp;</div>
          <div>&lt; → &amp;lt;</div>
          <div>&gt; → &amp;gt;</div>
          <div>&quot; → &amp;quot;</div>
          <div>&apos; → &amp;#39;</div>
          <div>&nbsp; → &amp;nbsp;</div>
          <div>&copy; → &amp;copy;</div>
          <div>&reg; → &amp;reg;</div>
        </div>
      </div>
    </div>
  );
}
