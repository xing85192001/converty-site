// Script to update common namespace strings for all languages
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = './src/messages';

// Common namespace translations for key strings
const COMMON_UPDATES = {
  vi: {
    "coreFeatures": "Tính năng cốt lõi",
    "toolHighlights": "Điểm nổi bật của công cụ",
    "reset": "Đặt lại",
    "allTools": "Tất cả công cụ",
    "homepageViewBlog": "Xem blog",
    "navigation": {
      "moreTools": "Nhiều công cụ hơn"
    }
  },
  id: {
    "coreFeatures": "Fitur Inti",
    "toolHighlights": "Sorotan Alat",
    "reset": "Atur ulang",
    "allTools": "Semua Alat",
    "homepageViewBlog": "Lihat Blog",
    "navigation": {
      "moreTools": "Lebih Banyak Alat"
    }
  },
  pt: {
    "coreFeatures": "Recursos principais",
    "toolHighlights": "Destaques da ferramenta",
    "reset": "Redefinir",
    "allTools": "Todas as ferramentas",
    "homepageViewBlog": "Ver blog",
    "navigation": {
      "moreTools": "Mais ferramentas"
    }
  },
  ms: {
    "coreFeatures": "Ciri-ciri Teras",
    "toolHighlights": "Sorotan Alat",
    "reset": "Tetapkan semula",
    "allTools": "Semua Alat",
    "homepageViewBlog": "Lihat Blog",
    "navigation": {
      "moreTools": "Lebih Banyak Alat"
    }
  },
  cs: {
    "coreFeatures": "Hlavní funkce",
    "toolHighlights": "Výhody nástroje",
    "reset": "Resetovat",
    "allTools": "Všechny nástroje",
    "homepageViewBlog": "Zobrazit blog",
    "navigation": {
      "moreTools": "Další nástroje"
    }
  },
  es: {
    "coreFeatures": "Características principales",
    "toolHighlights": "Destacados de la herramienta",
    "reset": "Reiniciar",
    "allTools": "Todas las herramientas",
    "homepageViewBlog": "Ver blog",
    "navigation": {
      "moreTools": "Más herramientas"
    }
  },
  fr: {
    "coreFeatures": "Fonctionnalités principales",
    "toolHighlights": "Points forts de l'outil",
    "reset": "Réinitialiser",
    "allTools": "Tous les outils",
    "homepageViewBlog": "Voir le blog",
    "navigation": {
      "moreTools": "Plus d'outils"
    }
  },
  de: {
    "coreFeatures": "Hauptfunktionen",
    "toolHighlights": "Tool-Highlights",
    "reset": "Zurücksetzen",
    "allTools": "Alle Tools",
    "homepageViewBlog": "Blog ansehen",
    "navigation": {
      "moreTools": "Mehr Tools"
    }
  },
  el: {
    "coreFeatures": "Βασικές λειτουργίες",
    "toolHighlights": "Προσθήκες εργαλείου",
    "reset": "Επαναφορά",
    "allTools": "Όλα τα εργαλεία",
    "homepageViewBlog": "Προβολή ιστολογίου",
    "navigation": {
      "moreTools": "Περισσότερα εργαλεία"
    }
  },
  hu: {
    "coreFeatures": "Főbb funkciók",
    "toolHighlights": "Eszközhasználat",
    "reset": "Visszaállítás",
    "allTools": "Összes eszköz",
    "homepageViewBlog": "Blog megtekintése",
    "navigation": {
      "moreTools": "További eszközök"
    }
  },
  it: {
    "coreFeatures": "Funzionalità principali",
    "toolHighlights": "Caratteristiche dello strumento",
    "reset": "Reimposta",
    "allTools": "Tutti gli strumenti",
    "homepageViewBlog": "Vedi blog",
    "navigation": {
      "moreTools": "Altri strumenti"
    }
  },
  nl: {
    "coreFeatures": "Hoofdfuncties",
    "toolHighlights": "Tool-hoogtepunten",
    "reset": "Resetten",
    "allTools": "Alle tools",
    "homepageViewBlog": "Blog bekijken",
    "navigation": {
      "moreTools": "Meer tools"
    }
  },
  th: {
    "coreFeatures": "คุณสมบัติหลัก",
    "toolHighlights": "จุดเด่นของเครื่องมือ",
    "reset": "รีเซ็ต",
    "allTools": "เครื่องมือทั้งหมด",
    "homepageViewBlog": "ดูบล็อก",
    "navigation": {
      "moreTools": "เครื่องมือเพิ่มเติม"
    }
  },
  tr: {
    "coreFeatures": "Temel özellikler",
    "toolHighlights": "Araç öne çıkanları",
    "reset": "Sıfırla",
    "allTools": "Tüm araçlar",
    "homepageViewBlog": "Blogu görüntüle",
    "navigation": {
      "moreTools": "Daha fazla araç"
    }
  },
  uk: {
    "coreFeatures": "Основні функції",
    "toolHighlights": "Особливості інструменту",
    "reset": "Скинути",
    "allTools": "Усі інструменти",
    "homepageViewBlog": "Переглянути блог",
    "navigation": {
      "moreTools": "Більше інструментів"
    }
  },
  ru: {
    "coreFeatures": "Основные функции",
    "toolHighlights": "Особенности инструмента",
    "reset": "Сбросить",
    "allTools": "Все инструменты",
    "homepageViewBlog": "Посмотреть блог",
    "navigation": {
      "moreTools": "Больше инструментов"
    }
  },
  ko: {
    "coreFeatures": "주요 기능",
    "toolHighlights": "도구 하이라이트",
    "reset": "초기화",
    "allTools": "모든 도구",
    "homepageViewBlog": "블로그 보기",
    "navigation": {
      "moreTools": "더 많은 도구"
    }
  },
  ja: {
    "coreFeatures": "主な機能",
    "toolHighlights": "ツールの特長",
    "reset": "リセット",
    "allTools": "すべてのツール",
    "homepageViewBlog": "ブログを見る",
    "navigation": {
      "moreTools": "その他のツール"
    }
  },
  ar: {
    "coreFeatures": "الميزات الأساسية",
    "toolHighlights": "أبرز أدوات",
    "reset": "إعادة ضبط",
    "allTools": "جميع الأدوات",
    "homepageViewBlog": "عرض المدونة",
    "navigation": {
      "moreTools": "مزيد من الأدوات"
    }
  },
};

for (const [locale, updates] of Object.entries(COMMON_UPDATES)) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${locale}: file not found`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!data.common) {
    console.log(`Skipping ${locale}: no common namespace`);
    continue;
  }

  // Update common namespace
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'navigation') {
      if (!data.common.navigation) data.common.navigation = {};
      for (const [subKey, subValue] of Object.entries(value)) {
        data.common.navigation[subKey] = subValue;
      }
    } else {
      data.common[key] = value;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`${locale}: common namespace updated`);
}

console.log('\nDone!');