const fs = require('fs');
const content = fs.readFileSync('src/lib/registry/tool-features.ts', 'utf-8');

// Check if German translations exist
const hasDeFuel = content.includes('"Fuel economy": "Kraftstoffverbrauch"');
const hasDeRealTime = content.includes('"Real-time calculation": "Echtzeitberechnung"');

console.log('Has de Fuel economy:', hasDeFuel);
console.log('Has de Real-time:', hasDeRealTime);

// Find the German section
const deStart = content.indexOf('  de: {');
const frStart = content.indexOf('  fr: {');
if (deStart > -1) {
  const deSection = content.substring(deStart, frStart > -1 ? frStart : deStart + 5000);
  const keys = deSection.match(/"[^"]+":/g);
  console.log('Keys in de section:', keys ? keys.length : 0);
  if (keys) {
    console.log('First 5 keys:', keys.slice(0, 5).join(', '));
  }
} else {
  console.log('German section not found!');
}