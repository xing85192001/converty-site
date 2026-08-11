"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { OutputDisplay } from "@/components/converter";
import {
  decodeBase64,
  decodeURL,
  encodeBase64,
  encodeURL,
  escapeHtml,
  SPECIAL_CHARS,
  unescapeHtml,
} from "@/lib/converters/web/url-encoder";

type Mode = "encode" | "decode";

export function URLEncoderConverter() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const [input, setInput] = useState("Hello World! How are you?");
  const [mode, setMode] = useState<Mode>("encode");

  const urlResult = mode === "encode" ? encodeURL(input) : decodeURL(input);
  const base64Result = mode === "encode" ? encodeBase64(input) : decodeBase64(input);
  const htmlResult = mode === "encode" ? escapeHtml(input) : unescapeHtml(input);

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("encode")}
          className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors ${
            mode === "encode" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode("decode")}
          className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors ${
            mode === "decode" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
          }`}
        >
          Decode
        </button>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label htmlFor="input" className="text-sm font-medium">
          {tSections("input")}
        </label>
        <textarea
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full min-h-24 p-3 rounded-md border bg-background font-mono text-sm resize-y"
          placeholder={
            mode === "encode" ? "Enter text to encode..." : "Enter encoded text to decode..."
          }
        />
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{urlResult.characterCount} characters</span>
          <span>{urlResult.byteLength} bytes</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <OutputDisplay
          label={t("urlEncoded")}
          value={mode === "encode" ? urlResult.encoded : urlResult.decoded}
          copyable
          className="font-mono text-sm"
        />

        <OutputDisplay
          label={t("base64")}
          value={base64Result}
          copyable
          className="font-mono text-sm"
        />

        <OutputDisplay
          label={t("htmlEntities")}
          value={htmlResult}
          copyable
          className="font-mono text-sm"
        />
      </div>

      {/* Special Characters Reference */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Common URL Encodings</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Character</th>
                <th className="text-left py-2 font-medium">Encoded</th>
                <th className="text-left py-2 font-medium">Name</th>
              </tr>
            </thead>
            <tbody>
              {SPECIAL_CHARS.slice(0, 12).map((item) => (
                <tr key={item.encoded} className="border-b border-muted">
                  <td className="py-2 font-mono">{item.char || "(space)"}</td>
                  <td className="py-2 font-mono text-primary">{item.encoded}</td>
                  <td className="py-2 text-muted-foreground">{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
