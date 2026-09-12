import { readFileSync, writeFileSync } from "node:fs";

// New internal-link i18n keys to inject into every locale file.
// home.popularTitle / home.popularDesc  -> homepage "Popular Calculators" block
// common.relatedCategories              -> category page bottom "Related Categories" block
const translations = {
  en: {
    home: {
      popularTitle: "Popular Calculators",
      popularDesc:
        "Jump straight to the calculators our visitors reach for most often.",
    },
    common: { relatedCategories: "Related Categories" },
  },
  zh: {
    home: {
      popularTitle: "热门计算器",
      popularDesc: "直达用户最常用的计算器，省去查找时间。",
    },
    common: { relatedCategories: "相关分类" },
  },
  "zh-TW": {
    home: {
      popularTitle: "熱門計算器",
      popularDesc: "直達使用者最常用的計算器，省去查找時間。",
    },
    common: { relatedCategories: "相關分類" },
  },
  de: {
    home: {
      popularTitle: "Beliebte Rechner",
      popularDesc:
        "Springe direkt zu den Rechnern, die unsere Besucher am häufigsten nutzen.",
    },
    common: { relatedCategories: "Verwandte Kategorien" },
  },
  ja: {
    home: {
      popularTitle: "人気の計算ツール",
      popularDesc: "よく使われる計算ツールへ直接移動できます。",
    },
    common: { relatedCategories: "関連カテゴリー" },
  },
  es: {
    home: {
      popularTitle: "Calculadoras Populares",
      popularDesc:
        "Accede directamente a las calculadoras que nuestros visitantes usan más.",
    },
    common: { relatedCategories: "Categorías Relacionadas" },
  },
};

const dir = "src/messages";
for (const [locale, tr] of Object.entries(translations)) {
  const file = `${dir}/${locale}.json`;
  const j = JSON.parse(readFileSync(file, "utf8"));
  j.home = j.home || {};
  j.home.popularTitle = tr.home.popularTitle;
  j.home.popularDesc = tr.home.popularDesc;
  j.common = j.common || {};
  j.common.relatedCategories = tr.common.relatedCategories;
  writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
  console.log(`updated ${file}`);
}
