import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();
const locales = ["en", "fr", "de", "it", "zh"];

const extra = {
  en: {
    relatedTitle: "Related articles",
    heroBadge: "Practical guides & calculators",
  },
  fr: {
    relatedTitle: "Articles connexes",
    heroBadge: "Guides pratiques et calculateurs",
  },
  de: {
    relatedTitle: "Verwandte Artikel",
    heroBadge: "Praktische Anleitungen & Rechner",
  },
  it: {
    relatedTitle: "Articoli correlati",
    heroBadge: "Guide pratiche e calcolatori",
  },
  zh: {
    relatedTitle: "相关文章",
    heroBadge: "实用指南与计算器",
  },
};

for (const locale of locales) {
  const path = resolve(root, `src/messages/${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf-8"));

  data.blog = {
    ...data.blog,
    ...extra[locale],
  };

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`Updated ${locale}.json`);
}
