// Script to update remaining untranslated financing strings
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = './src/messages';

const FINANCING_REMAINING = {
  vi: {
    "interestRate": "Lãi suất (%)",
    "loanTerm": "Thời hạn vay",
    "loanAmount": "Số tiền vay",
    "total": "tổng",
    "months": "tháng",
    "years": "năm",
    "year": "năm",
    "month": "tháng"
  },
  id: {
    "interestRate": "Suku bunga (%)",
    "loanTerm": "Jangka waktu pinjaman",
    "loanAmount": "Jumlah pinjaman",
    "total": "total",
    "months": "bulan",
    "years": "tahun",
    "year": "tahun",
    "month": "bulan"
  },
  pt: {
    "interestRate": "Taxa de juros (%)",
    "loanTerm": "Prazo do empréstimo",
    "loanAmount": "Valor do empréstimo",
    "total": "total",
    "months": "meses",
    "years": "anos",
    "year": "ano",
    "month": "mês"
  },
  ms: {
    "interestRate": "Kadar faedah (%)",
    "loanTerm": "Tempoh pinjaman",
    "loanAmount": "Jumlah pinjaman",
    "total": "jumlah",
    "months": "bulan",
    "years": "tahun",
    "year": "tahun",
    "month": "bulan"
  },
  cs: {
    "interestRate": "Úroková sazba (%)",
    "loanTerm": "Délka půjčky",
    "loanAmount": "Výše půjčky",
    "total": "celkem",
    "months": "měsíců",
    "years": "let",
    "year": "rok",
    "month": "měsíc"
  },
  es: {
    "interestRate": "Tasa de interés (%)",
    "loanTerm": "Plazo del préstamo",
    "loanAmount": "Monto del préstamo",
    "total": "total",
    "months": "meses",
    "years": "años",
    "year": "año",
    "month": "mes"
  },
  fr: {
    "interestRate": "Taux d'intérêt (%)",
    "loanTerm": "Durée du prêt",
    "loanAmount": "Montant du prêt",
    "total": "total",
    "months": "mois",
    "years": "ans",
    "year": "an",
    "month": "mois"
  },
  de: {
    "interestRate": "Zinssatz (%)",
    "loanTerm": "Kreditlaufzeit",
    "loanAmount": "Kreditbetrag",
    "total": "gesamt",
    "months": "Monate",
    "years": "Jahre",
    "year": "Jahr",
    "month": "Monat"
  },
  el: {
    "interestRate": "Επιτόκιο (%)",
    "loanTerm": "Διάρκεια δανείου",
    "loanAmount": "Ποσό δανείου",
    "total": "συνολικά",
    "months": "μήνες",
    "years": "έτη",
    "year": "έτος",
    "month": "μήνας"
  },
  hu: {
    "interestRate": "Kamatláb (%)",
    "loanTerm": "Hitelfutamidő",
    "loanAmount": "Hitelösszeg",
    "total": "összesen",
    "months": "hónap",
    "years": "év",
    "year": "év",
    "month": "hónap"
  },
  it: {
    "interestRate": "Tasso di interesse (%)",
    "loanTerm": "Durata del prestito",
    "loanAmount": "Importo del prestito",
    "total": "totale",
    "months": "mesi",
    "years": "anni",
    "year": "anno",
    "month": "mese"
  },
  nl: {
    "interestRate": "Rentepercentage (%)",
    "loanTerm": "Krediettermijn",
    "loanAmount": "Kredietbedrag",
    "total": "totaal",
    "months": "maanden",
    "years": "jaar",
    "year": "jaar",
    "month": "maand"
  },
  th: {
    "interestRate": "อัตราดอกเบี้ย (%)",
    "loanTerm": "ระยะเวลากู้",
    "loanAmount": "จำนวนเงินกู้",
    "total": "รวม",
    "months": "เดือน",
    "years": "ปี",
    "year": "ปี",
    "month": "เดือน"
  },
  tr: {
    "interestRate": "Faiz Oranı (%)",
    "loanTerm": "Kredi Süresi",
    "loanAmount": "Kredi Tutarı",
    "total": "toplam",
    "months": "ay",
    "years": "yıl",
    "year": "yıl",
    "month": "ay"
  },
  uk: {
    "interestRate": "Відсоткова ставка (%)",
    "loanTerm": "Термін позики",
    "loanAmount": "Сума позики",
    "total": "всього",
    "months": "місців",
    "years": "років",
    "year": "рік",
    "month": "місяць"
  },
  ru: {
    "interestRate": "Процентная ставка (%)",
    "loanTerm": "Срок кредита",
    "loanAmount": "Сумма кредита",
    "total": "всего",
    "months": "месяцев",
    "years": "лет",
    "year": "год",
    "month": "месяц"
  },
  ko: {
    "interestRate": "이자율 (%)",
    "loanTerm": "대출 기간",
    "loanAmount": "대출 금액",
    "total": "총계",
    "months": "개월",
    "years": "년",
    "year": "년",
    "month": "개월"
  },
  ja: {
    "interestRate": "金利 (%)",
    "loanTerm": "ローン期間",
    "loanAmount": "ローン金額",
    "total": "合計",
    "months": "ヶ月",
    "years": "年",
    "year": "年",
    "month": "ヶ月"
  },
  ar: {
    "interestRate": "معدل الفائدة (%)",
    "loanTerm": "مدة القرض",
    "loanAmount": "مبلغ القرض",
    "total": "المجموع",
    "months": "أشهر",
    "years": "سنوات",
    "year": "سنة",
    "month": "شهر"
  },
};

for (const [locale, updates] of Object.entries(FINANCING_REMAINING)) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${locale}: file not found`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!data.calculator || !data.calculator.automotive || !data.calculator.automotive.financing) {
    console.log(`Skipping ${locale}: financing section not found`);
    continue;
  }

  const financing = data.calculator.automotive.financing;
  
  for (const [key, value] of Object.entries(updates)) {
    financing[key] = value;
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`${locale}: financing remaining updated`);
}

console.log('\nDone!');