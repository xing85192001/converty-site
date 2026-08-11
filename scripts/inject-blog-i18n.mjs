import { readFileSync, writeFileSync } from "node:fs";

const locales = ["en", "fr", "de", "it", "zh"];

const blog = {
  en: {
    title: "Articles & Guides",
    subtitle:
      "Practical explainers on money, health, and everyday math, paired with our free calculators.",
    readMore: "Read article",
    publishedOn: "Published",
    minRead: "min read",
    backToBlog: "Back to all articles",
    all: "All",
    category: { finance: "Finance", health: "Health", math: "Math", cooking: "Cooking" },
  },
  fr: {
    title: "Articles et guides",
    subtitle:
      "Des explications pratiques sur l'argent, la santé et les mathématiques du quotidien, associées à nos calculateurs gratuits.",
    readMore: "Lire l'article",
    publishedOn: "Publié le",
    minRead: "min de lecture",
    backToBlog: "Retour aux articles",
    all: "Tous",
    category: {
      finance: "Finance",
      health: "Santé",
      math: "Mathématiques",
      cooking: "Cuisine",
    },
  },
  de: {
    title: "Artikel & Anleitungen",
    subtitle:
      "Praktische Erklärungen zu Geld, Gesundheit und Alltagsmathematik – kombiniert mit unseren kostenlosen Rechnern.",
    readMore: "Artikel lesen",
    publishedOn: "Veröffentlicht",
    minRead: "Min. Lesezeit",
    backToBlog: "Zurück zu den Artikeln",
    all: "Alle",
    category: {
      finance: "Finanzen",
      health: "Gesundheit",
      math: "Mathematik",
      cooking: "Kochen",
    },
  },
  it: {
    title: "Articoli e guide",
    subtitle:
      "Spiegazioni pratiche su soldi, salute e matematica di tutti i giorni, abbinate ai nostri calcolatori gratuiti.",
    readMore: "Leggi l'articolo",
    publishedOn: "Pubblicato il",
    minRead: "min di lettura",
    backToBlog: "Torna agli articoli",
    all: "Tutti",
    category: {
      finance: "Finanza",
      health: "Salute",
      math: "Matematica",
      cooking: "Cucina",
    },
  },
};

for (const locale of locales) {
  const path = `./src/messages/${locale}.json`;
  const obj = JSON.parse(readFileSync(path, "utf8"));

  // Blog namespace
  obj.blog = blog[locale];

  // Nav + footer labels
  obj.common.blog = "Blog";
  obj.common.footer.links.blog = "Blog";

  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
  console.log(`Updated ${path}`);
}
