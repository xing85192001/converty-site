"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  getCharsByCategory,
  HTML_CHAR_CATEGORIES,
  HTML_CHAR_ENTITIES,
  type HTMLCharCategory,
  searchChars,
} from "@/lib/converters/web/html-chars";

export function HTMLCharMap() {
  const t = useTranslations("calculator.labels");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<HTMLCharCategory | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);

  const filteredChars = search
    ? searchChars(search)
    : category === "all"
      ? HTML_CHAR_ENTITIES
      : getCharsByCategory(category);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
        toast.success("Copied to clipboard");
      })
      .catch((error) => {
        console.error("Failed to copy to clipboard:", error);
        toast.error("Failed to copy to clipboard");
      });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("search")}</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("category")}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as HTMLCharCategory | "all")}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            <option value="all">All Categories</option>
            {HTML_CHAR_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Showing {filteredChars.length} character{filteredChars.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Char</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Entity</th>
              <th className="text-left py-2">Decimal</th>
              <th className="text-left py-2">Hex</th>
              <th className="text-left py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredChars.map((entity) => (
              <tr key={entity.name} className="border-b border-muted hover:bg-muted/50">
                <td className="py-2">
                  <button
                    onClick={() => copyToClipboard(entity.char, `char-${entity.name}`)}
                    className="text-2xl hover:bg-primary/10 px-2 py-1 rounded"
                    title="Click to copy character"
                  >
                    {entity.char}
                  </button>
                  {copied === `char-${entity.name}` && (
                    <span className="text-xs text-green-600 ml-1">Copied!</span>
                  )}
                </td>
                <td className="py-2 font-mono text-muted-foreground">{entity.name}</td>
                <td className="py-2">
                  <button
                    onClick={() => copyToClipboard(entity.entity, `entity-${entity.name}`)}
                    className="font-mono text-primary hover:underline"
                    title="Click to copy entity"
                  >
                    {entity.entity}
                  </button>
                  {copied === `entity-${entity.name}` && (
                    <span className="text-xs text-green-600 ml-1">Copied!</span>
                  )}
                </td>
                <td className="py-2 font-mono text-muted-foreground">&amp;#{entity.decimal};</td>
                <td className="py-2 font-mono text-muted-foreground">&amp;#x{entity.hex};</td>
                <td className="py-2 text-muted-foreground">{entity.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
