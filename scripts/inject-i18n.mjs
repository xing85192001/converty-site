import { readFileSync, writeFileSync } from "node:fs";

const blocks = {
  "unit-converter": {
    name: "Unit Converter",
    description:
      "Convert between units of length, mass, temperature, area, volume, speed, time, data, energy, power and pressure.",
    metaDescription:
      "Free online unit converter for length, mass, temperature, area, volume, speed, time, data, energy, power and pressure.",
    category: "Category",
    value: "Value",
    from: "From",
    to: "To",
    swap: "Swap",
  },
  "set-calculator": {
    name: "Set Calculator",
    description:
      "Perform set operations: union, intersection, difference, symmetric difference, cartesian product and set relations.",
    metaDescription:
      "Free online set calculator for union, intersection, difference, symmetric difference, cartesian product and subset checks.",
    setA: "Set A",
    setB: "Set B",
    operation: "Operation",
    hint: "Enter elements separated by commas (e.g. 1, 2, 3).",
    cardinality: "Cardinality",
    resultSet: "Result set",
  },
  "programmer-calculator": {
    name: "Programmer Calculator",
    description:
      "Convert between decimal, hexadecimal, octal and binary and apply bitwise and shift operations.",
    metaDescription:
      "Free online programmer calculator: base conversion (dec/hex/oct/bin) with bitwise AND/OR/XOR and shifts.",
    valueA: "Value A",
    valueB: "Value B",
    bitwise: "Bitwise operation",
    shift: "Shift",
    none: "None",
    left: "Left (<<)",
    right: "Right (>>)",
    reprA: "A representations",
    reprB: "B representations",
  },
  "debt-snowball-avalanche": {
    name: "Debt Payoff Planner",
    description:
      "Compare the snowball and avalanche debt payoff strategies and see which clears your debt faster.",
    metaDescription:
      "Free debt payoff planner comparing snowball vs avalanche methods with total interest and payoff order.",
    debts: "Debts",
    hint: "One debt per line: Name, Balance, Annual Rate %, Minimum Payment.",
    extra: "Extra monthly payment",
    snowball: "Snowball (smallest balance first)",
    avalanche: "Avalanche (highest rate first)",
    months: "Months",
    totalInterest: "Total interest",
    totalPaid: "Total paid",
    order: "Payoff order",
    savings: "Avalanche saves {months} months and {interest} in interest versus snowball.",
  },
  "income-tax": {
    name: "Income Tax Calculator",
    description: "Calculate progressive income tax with presets or your own custom tax brackets.",
    metaDescription: "Free progressive income tax calculator with US, UK and custom bracket support.",
    system: "Tax system",
    income: "Taxable income",
    brackets: "Custom brackets",
    hint: "One bracket per line: upper limit, rate%. Use 0 as the top limit for an open-ended bracket.",
    tax: "Tax owed",
    effectiveRate: "Effective rate",
    marginalRate: "Marginal rate",
    net: "Net income",
    breakdown: "Per-bracket breakdown",
  },
};

const translations = {
  fr: {
    "unit-converter": {
      name: "Convertisseur d'unités",
      description:
        "Convertissez entre les unités de longueur, masse, température, aire, volume, vitesse, temps, données, énergie, puissance et pression.",
      metaDescription:
        "Convertisseur d'unités en ligne gratuit pour longueur, masse, température, aire, volume, vitesse, temps, données, énergie, puissance et pression.",
    },
    "set-calculator": {
      name: "Calculateur d'ensembles",
      description:
        "Effectuez des opérations sur les ensembles : union, intersection, différence, différence symétrique, produit cartésien et relations.",
      metaDescription:
        "Calculateur d'ensembles en ligne gratuit pour union, intersection, différence, différence symétrique, produit cartésien et inclusions.",
    },
    "programmer-calculator": {
      name: "Calculatrice pour programmeurs",
      description:
        "Convertissez entre décimal, hexadécimal, octal et binaire et appliquez des opérations bit à bit et des décalages.",
      metaDescription:
        "Calculatrice pour programmeurs en ligne gratuite : conversion de base (déc/hex/oct/bin) avec ET/OU/XOU bit à bit et décalages.",
    },
    "debt-snowball-avalanche": {
      name: "Planificateur de remboursement de dettes",
      description:
        "Comparez les stratégies boule de neige et avalanche et voyez celle qui rembourse vos dettes le plus vite.",
      metaDescription:
        "Planificateur de remboursement de dettes gratuit comparant les méthodes boule de neige et avalanche avec intérêts totaux et ordre de remboursement.",
    },
    "income-tax": {
      name: "Calculatrice d'impôt sur le revenu",
      description: "Calculez l'impôt progressif sur le revenu avec des préréglages ou vos propres tranches.",
      metaDescription:
        "Calculatrice d'impôt sur le revenu progressif gratuite avec préréglages US, UK et tranches personnalisées.",
    },
  },
  de: {
    "unit-converter": {
      name: "Einheitenrechner",
      description:
        "Rechnen Sie zwischen Einheiten für Länge, Masse, Temperatur, Fläche, Volumen, Geschwindigkeit, Zeit, Daten, Energie, Leistung und Druck um.",
      metaDescription:
        "Kostenloser Online-Einheitenrechner für Länge, Masse, Temperatur, Fläche, Volumen, Geschwindigkeit, Zeit, Daten, Energie, Leistung und Druck.",
    },
    "set-calculator": {
      name: "Mengenrechner",
      description:
        "Führen Sie Mengenoperationen aus: Vereinigung, Schnittmenge, Differenz, symmetrische Differenz, kartesisches Produkt und Relationen.",
      metaDescription:
        "Kostenloser Online-Mengenrechner für Vereinigung, Schnittmenge, Differenz, symmetrische Differenz, kartesisches Produkt und Teilmengenprüfung.",
    },
    "programmer-calculator": {
      name: "Programmierer-Taschenrechner",
      description:
        "Konvertieren Sie zwischen Dezimal, Hexadezimal, Oktal und Binär und wenden Sie bitweise Operationen und Verschiebungen an.",
      metaDescription:
        "Kostenloser Online-Programmierer-Rechner: Basis-Konvertierung (Dez/Hex/Okt/Bin) mit bitweisem UND/ODER/XOR und Shifts.",
    },
    "debt-snowball-avalanche": {
      name: "Schulden-Tilgungsplaner",
      description:
        "Vergleichen Sie die Schneeball- und Lawinen-Tilgungsstrategie und sehen Sie, welche Ihre Schulden schneller abbaut.",
      metaDescription:
        "Kostenloser Schulden-Tilgungsplaner, der Schneeball- und Lawinen-Methode mit Zinsen gesamt und Tilgungsreihenfolge vergleicht.",
    },
    "income-tax": {
      name: "Einkommensteuer-Rechner",
      description: "Berechnen Sie die progressive Einkommensteuer mit Voreinstellungen oder eigenen Steuerklassen.",
      metaDescription:
        "Kostenloser progressiver Einkommensteuer-Rechner mit US-, UK- und benutzerdefinierten Steuerklassen.",
    },
  },
  it: {
    "unit-converter": {
      name: "Convertitore di unità",
      description:
        "Converti tra unità di lunghezza, massa, temperatura, area, volume, velocità, tempo, dati, energia, potenza e pressione.",
      metaDescription:
        "Convertitore di unità online gratuito per lunghezza, massa, temperatura, area, volume, velocità, tempo, dati, energia, potenza e pressione.",
    },
    "set-calculator": {
      name: "Calcolatrice insiemi",
      description:
        "Esegui operazioni sugli insiemi: unione, intersezione, differenza, differenza simmetrica, prodotto cartesiano e relazioni.",
      metaDescription:
        "Calcolatrice insiemi online gratuita per unione, intersezione, differenza, differenza simmetrica, prodotto cartesiano e verifica sottoinsiemi.",
    },
    "programmer-calculator": {
      name: "Calcolatrice per programmatori",
      description:
        "Converti tra decimale, esadecimale, ottale e binario e applica operazioni bit a bit e shift.",
      metaDescription:
        "Calcolatrice per programmatori online gratuita: conversione di base (dec/hex/oct/bin) con AND/OR/XOR bit a bit e shift.",
    },
    "debt-snowball-avalanche": {
      name: "Pianificatore di estinzione debiti",
      description:
        "Confronta le strategie snowball e avalanche e scopri quale estingue i debiti più velocemente.",
      metaDescription:
        "Pianificatore di estinzione debiti gratuito che confronta i metodi snowball e avalanche con interessi totali e ordine di estinzione.",
    },
    "income-tax": {
      name: "Calcolatrice imposta sul reddito",
      description: "Calcola l'imposta progressiva sul reddito con preset o tue fasce personalizzate.",
      metaDescription:
        "Calcolatrice imposta sul reddito progressiva gratuita con supporto per fasce USA, Regno Unito e personalizzate.",
    },
  },
};

for (const loc of ["en", "fr", "de", "it"]) {
  const file = `src/messages/${loc}.json`;
  const data = JSON.parse(readFileSync(file, "utf8"));
  const merged = { ...blocks };
  if (loc !== "en") {
    for (const key of Object.keys(merged)) {
      merged[key] = { ...merged[key], ...translations[loc][key] };
    }
  }
  data.converter = { ...data.converter, ...merged };
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log("updated", file);
}
