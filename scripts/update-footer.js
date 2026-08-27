// Script to update footer namespace for all languages
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = './src/messages';

const FOOTER_UPDATES = {
  vi: {
    "copyright": "Bảo lưu mọi quyền",
    "links": {
      "privacy": "Chính sách bảo mật",
      "about": "Giới thiệu",
      "contact": "Liên hệ",
      "terms": "Điều khoản dịch vụ",
      "blog": "Blog"
    }
  },
  id: {
    "copyright": "Hak cipta dilindungi",
    "links": {
      "privacy": "Kebijakan Privasi",
      "about": "Tentang",
      "contact": "Kontak",
      "terms": "Syarat Layanan",
      "blog": "Blog"
    }
  },
  pt: {
    "copyright": "Todos os direitos reservados",
    "links": {
      "privacy": "Política de Privacidade",
      "about": "Sobre",
      "contact": "Contato",
      "terms": "Termos de Serviço",
      "blog": "Blog"
    }
  },
  ms: {
    "copyright": "Hak cipta terpelihara",
    "links": {
      "privacy": "Dasar Privasi",
      "about": "Mengenai",
      "contact": "Hubungi",
      "terms": "Terma Perkhidmatan",
      "blog": "Blog"
    }
  },
  cs: {
    "copyright": "Všechna práva vyhrazena",
    "links": {
      "privacy": "Zásady ochrany osobních údajů",
      "about": "O nás",
      "contact": "Kontakt",
      "terms": "Podmínky služby",
      "blog": "Blog"
    }
  },
  es: {
    "copyright": "Todos los derechos reservados",
    "links": {
      "privacy": "Política de Privacidad",
      "about": "Acerca de",
      "contact": "Contacto",
      "terms": "Términos de Servicio",
      "blog": "Blog"
    }
  },
  fr: {
    "copyright": "Tous droits réservés",
    "links": {
      "privacy": "Politique de confidentialité",
      "about": "À propos",
      "contact": "Contact",
      "terms": "Conditions d'utilisation",
      "blog": "Blog"
    }
  },
  de: {
    "copyright": "Alle Rechte vorbehalten",
    "links": {
      "privacy": "Datenschutzerklärung",
      "about": "Über uns",
      "contact": "Kontakt",
      "terms": "Nutzungsbedingungen",
      "blog": "Blog"
    }
  },
  el: {
    "copyright": "Με επιφύλαξη κάθε νόμιμου δικαιώματος",
    "links": {
      "privacy": "Πολιτική Απορρήτου",
      "about": "Σχετικά",
      "contact": "Επικοινωνία",
      "terms": "Όροι Υπηρεσίας",
      "blog": "Ιστολόγιο"
    }
  },
  hu: {
    "copyright": "Minden jog fenntartva",
    "links": {
      "privacy": "Adatvédelmi szabályzat",
      "about": "Rólunk",
      "contact": "Kapcsolat",
      "terms": "Szolgáltatási feltételek",
      "blog": "Blog"
    }
  },
  it: {
    "copyright": "Tutti i diritti riservati",
    "links": {
      "privacy": "Informativa sulla privacy",
      "about": "Chi siamo",
      "contact": "Contatti",
      "terms": "Termini di servizio",
      "blog": "Blog"
    }
  },
  nl: {
    "copyright": "Alle rechten voorbehouden",
    "links": {
      "privacy": "Privacybeleid",
      "about": "Over ons",
      "contact": "Contact",
      "terms": "Servicevoorwaarden",
      "blog": "Blog"
    }
  },
  th: {
    "copyright": "สงวนลิขสิทธิ์",
    "links": {
      "privacy": "นโยบายความเป็นส่วนตัว",
      "about": "เกี่ยวกับเรา",
      "contact": "ติดต่อเรา",
      "terms": "เงื่อนไขการให้บริการ",
      "blog": "บล็อก"
    }
  },
  tr: {
    "copyright": "Tüm hakları saklıdır",
    "links": {
      "privacy": "Gizlilik Politikası",
      "about": "Hakkımızda",
      "contact": "İletişim",
      "terms": "Hizmet Şartları",
      "blog": "Blog"
    }
  },
  uk: {
    "copyright": "Всі права захищені",
    "links": {
      "privacy": "Політика конфіденційності",
      "about": "Про нас",
      "contact": "Контакти",
      "terms": "Умови обслуговування",
      "blog": "Блог"
    }
  },
  ru: {
    "copyright": "Все права защищены",
    "links": {
      "privacy": "Политика конфиденциальности",
      "about": "О нас",
      "contact": "Контакты",
      "terms": "Условия обслуживания",
      "blog": "Блог"
    }
  },
  ko: {
    "copyright": "판권 소유",
    "links": {
      "privacy": "개인정보 처리방침",
      "about": "소개",
      "contact": "연락처",
      "terms": "서비스 약관",
      "blog": "블로그"
    }
  },
  ja: {
    "copyright": "無断複製・転載を禁じます",
    "links": {
      "privacy": "プライバシーポリシー",
      "about": "概要",
      "contact": "お問い合わせ",
      "terms": "利用規約",
      "blog": "ブログ"
    }
  },
  ar: {
    "copyright": "جميع الحقوق محفوظة",
    "links": {
      "privacy": "سياسة الخصوصية",
      "about": "نبذة عنا",
      "contact": "اتصل بنا",
      "terms": "شروط الخدمة",
      "blog": "المدونة"
    }
  },
};

for (const [locale, updates] of Object.entries(FOOTER_UPDATES)) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${locale}: file not found`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!data.common) {
    console.log(`Skipping ${locale}: common namespace not found`);
    continue;
  }

  if (!data.common.footer) {
    data.common.footer = {};
  }

  data.common.footer.copyright = updates.copyright;
  data.common.footer.links = updates.links;
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`${locale}: footer updated`);
}

console.log('\nDone!');