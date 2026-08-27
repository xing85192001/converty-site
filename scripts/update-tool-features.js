// Script to add language translations to tool-features.ts
const fs = require('fs');
const path = require('path');

const FILE_PATH = './src/lib/registry/tool-features.ts';

// Read the file
let content = fs.readFileSync(FILE_PATH, 'utf-8');

// Find the end of the id section (before the closing of TRANSLATIONS)
// We need to insert new languages before the closing }; of TRANSLATIONS

const newLanguages = {
  de: {
    "Real-time calculation": "Echtzeitberechnung",
    "Results update automatically as you type": "Ergebnisse werden während der Eingabe automatisch aktualisiert",
    "Multi-platform ready": "Mehr-Plattform bereit",
    "Works smoothly on desktop and mobile devices": "Läuft reibungslos auf Desktop- und Mobilgeräten",
    "History ready": "Verlauf bereit",
    "Reuse previous values with one click": "Vorherige Werte mit einem Klick wiederverwenden",
    "Quick estimation": "Schnelle Schätzung",
    "Get results in seconds without complex spreadsheets": "Ergebnisse in Sekunden ohne komplexe Tabellenkalkulationen",
    "Amortization view": "Tilgungsansicht",
    "See how principal and interest change over time": "Sehen Sie, wie sich Kapital und Zinsen im Laufe der Zeit ändern",
    "Scenario compare": "Szenarienvergleich",
    "Test different rates, terms, and down payments": "Testen Sie verschiedene Zinssätze, Laufzeiten und Anzahlungen",
    "Export ready": "Export bereit",
    "Copy or print schedules for records": "Pläne für Aufzeichnungen kopieren oder drucken",
    "Fuel economy": "Kraftstoffverbrauch",
    "Compare MPG, L/100km, and cost per km": "MPG, L/100km und Kosten pro km vergleichen",
    "Loan planning": "Kreditplanung",
    "Estimate monthly auto payments": "Monatliche Autozahlungen schätzen",
    "Tire sizing": "Reifengröße",
    "Compare tire dimensions and speed ratings": "Reifendimensionen und Geschwindigkeitsbewertungen vergleichen",
    "Maintenance log": "Wartungsprotokoll",
    "Track service intervals and costs": "Serviceintervalle und Kosten verfolgen",
  },
  fr: {
    "Real-time calculation": "Calculation en temps réel",
    "Results update automatically as you type": "Les résultats se mettent à jour automatiquement lors de la saisie",
    "Multi-platform ready": "Multi-plateforme",
    "Works smoothly on desktop and mobile devices": "Fonctionne fluement sur les appareils de bureau et mobiles",
    "History ready": "Historique prêt",
    "Reuse previous values with one click": "Réutilisez les valeurs précédentes en un clic",
    "Quick estimation": "Estimation rapide",
    "Get results in seconds without complex spreadsheets": "Obtenez des résultats en quelques secondes sans tableurs complexes",
    "Amortization view": "Vue d'amortissement",
    "See how principal and interest change over time": "Voir comment le capital et les intérêts évoluent dans le temps",
    "Scenario compare": "Comparaison de scénarios",
    "Test different rates, terms, and down payments": "Testez différents taux, durées et apports",
    "Export ready": "Prêt à exporter",
    "Copy or print schedules for records": "Copiez ou imprimez les calendriers pour les dossiers",
    "Fuel economy": "Économie de carburant",
    "Compare MPG, L/100km, and cost per km": "Comparez MPG, L/100km et le coût par km",
    "Loan planning": "Planification de prêt",
    "Estimate monthly auto payments": "Estimez les paiements mensuels de la voiture",
    "Tire sizing": "Dimension des pneus",
    "Compare tire dimensions and speed ratings": "Comparez les dimensions des pneus et les indices de vitesse",
    "Maintenance log": "Journal de maintenance",
    "Track service intervals and costs": "Suivez les intervalles de service et les coûts",
  },
  es: {
    "Real-time calculation": "Cálculo en tiempo real",
    "Results update automatically as you type": "Los resultados se actualizan automáticamente al escribir",
    "Multi-platform ready": "Multiplataforma",
    "Works smoothly on desktop and mobile devices": "Funciona sin problemas en dispositivos de escritorio y móviles",
    "History ready": "Historial listo",
    "Reuse previous values with one click": "Reutiliza los valores anteriores con un clic",
    "Quick estimation": "Estimación rápida",
    "Get results in seconds without complex spreadsheets": "Obtén resultados en segundos sin hojas de cálculo complejas",
    "Amortization view": "Vista de amortización",
    "See how principal and interest change over time": "Ve cómo cambian el capital y los intereses con el tiempo",
    "Scenario compare": "Comparación de escenarios",
    "Test different rates, terms, and down payments": "Prueba diferentes tasas, plazos y pagos iniciales",
    "Export ready": "Listo para exportar",
    "Copy or print schedules for records": "Copia o imprime los calendarios para registros",
    "Fuel economy": "Economía de combustible",
    "Compare MPG, L/100km, and cost per km": "Compara MPG, L/100km y el coste por km",
    "Loan planning": "Planificación de préstamos",
    "Estimate monthly auto payments": "Estima los pagos mensuales del auto",
    "Tire sizing": "Tamaño de neumáticos",
    "Compare tire dimensions and speed ratings": "Compara dimensiones de neumáticos y clasificaciones de velocidad",
    "Maintenance log": "Registro de mantenimiento",
    "Track service intervals and costs": "Realiza un seguimiento de los intervalos de servicio y los costes",
  },
  it: {
    "Real-time calculation": "Calcolo in tempo reale",
    "Results update automatically as you type": "I risultati si aggiornano automaticamente durante la digitazione",
    "Multi-platform ready": "Multi-piattaforma",
    "Works smoothly on desktop and mobile devices": "Funziona senza problemi su dispositivi desktop e mobili",
    "History ready": "Cronologia pronta",
    "Reuse previous values with one click": "Riutilizza i valori precedenti con un clic",
    "Quick estimation": "Stima rapida",
    "Get results in seconds without complex spreadsheets": "Ottieni risultati in pochi secondi senza fogli di calcolo complessi",
    "Amortization view": "Vista di ammortamento",
    "See how principal and interest change over time": "Vedi come cambiano capitale e interessi nel tempo",
    "Scenario compare": "Confronto scenari",
    "Test different rates, terms, and down payments": "Prova diversi tassi, termini e acconti",
    "Export ready": "Pronto per l'esportazione",
    "Copy or print schedules for records": "Copia o stampa i calendari per i record",
    "Fuel economy": "Consumo di carburante",
    "Compare MPG, L/100km, and cost per km": "Confronta MPG, L/100km e il costo per km",
    "Loan planning": "Pianificazione prestiti",
    "Estimate monthly auto payments": "Stima i pagamenti mensili dell'auto",
    "Tire sizing": "Dimensioni pneumatici",
    "Compare tire dimensions and speed ratings": "Confronta dimensioni pneumatici e rating di velocità",
    "Maintenance log": "Registro manutenzione",
    "Track service intervals and costs": "Traccia intervalli di servizio e costi",
  },
};

// Convert newLanguages to a string
function langToString(langCode, translations) {
  let str = `  ${langCode}: {\n`;
  for (const [key, value] of Object.entries(translations)) {
    str += `    "${key}": "${value}",\n`;
  }
  str += `  },\n`;
  return str;
}

// Find the insertion point - after the last language entry (id)
// The id section ends with "  }," at line 353
// We insert before the closing "};"

const insertionPoint = content.lastIndexOf('  },\n};');
if (insertionPoint === -1) {
  console.error("Could not find insertion point");
  process.exit(1);
}

let newContent = content.slice(0, insertionPoint + 4) + '\n';

for (const [lang, translations] of Object.entries(newLanguages)) {
  newContent += langToString(lang, translations);
}

newContent += content.slice(insertionPoint + 4);

fs.writeFileSync(FILE_PATH, newContent, 'utf-8');
console.log("Successfully added translations for de, fr, es, it");
console.log("Total languages in TRANSLATIONS:", 
  (newContent.match(/^  [a-z]{2}: \{/gm) || []).length);