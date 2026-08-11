"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  EMOJI_CATEGORIES,
  EMOJI_DATA,
  type EmojiCategory,
  getEmojiByCategory,
  searchEmoji,
} from "@/lib/converters/web/emoji-chars";

export function EmojiMap() {
  const t = useTranslations("calculator.labels");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<EmojiCategory | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);

  const filteredEmoji = search
    ? searchEmoji(search)
    : category === "all"
      ? EMOJI_DATA
      : getEmojiByCategory(category);

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
            onChange={(e) => setCategory(e.target.value as EmojiCategory | "all")}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            <option value="all">All Categories</option>
            {EMOJI_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEmoji.length} emoji{filteredEmoji.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {filteredEmoji.map((emoji) => (
          <button
            key={emoji.name}
            onClick={() => copyToClipboard(emoji.emoji, emoji.name)}
            className={`p-3 rounded-lg border hover:bg-muted/50 text-2xl transition-colors ${
              copied === emoji.name ? "bg-green-500/20 border-green-500" : ""
            }`}
            title={`${emoji.name}: ${emoji.keywords.join(", ")}`}
          >
            {emoji.emoji}
          </button>
        ))}
      </div>

      {filteredEmoji.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Emoji</th>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Unicode</th>
                <th className="text-left py-2">HTML</th>
                <th className="text-left py-2">Keywords</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmoji.slice(0, 20).map((emoji) => (
                <tr key={emoji.name} className="border-b border-muted hover:bg-muted/50">
                  <td className="py-2">
                    <button
                      onClick={() => copyToClipboard(emoji.emoji, `table-${emoji.name}`)}
                      className="text-2xl hover:bg-primary/10 px-2 py-1 rounded"
                      title="Click to copy"
                    >
                      {emoji.emoji}
                    </button>
                  </td>
                  <td className="py-2">{emoji.name}</td>
                  <td className="py-2 font-mono text-muted-foreground">{emoji.unicode}</td>
                  <td className="py-2">
                    <button
                      onClick={() => copyToClipboard(emoji.htmlEntity, `html-${emoji.name}`)}
                      className="font-mono text-primary hover:underline"
                    >
                      {emoji.htmlEntity}
                    </button>
                  </td>
                  <td className="py-2 text-muted-foreground">{emoji.keywords.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmoji.length > 20 && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing 20 of {filteredEmoji.length} results
            </p>
          )}
        </div>
      )}
    </div>
  );
}
