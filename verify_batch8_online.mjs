import fs from 'fs';
import https from 'node:https';
import http from 'node:http';

const LANGS = ["en", "zh", "zh-TW", "de", "ja", "es"];
const BASE = "https://baikecalc.com";
const ids = ['aspect-fit','megapixel-aspects','portrait-distance','advanced-dof','macro-dof','dof-table','circle-of-confusion','light-ev','sun-position','star-trails','spot-stars','time-lapse','diffraction','macro-diffraction','video-file-size','audio-filesize','common-bitrates','dcp-filesize','foot-lambert','screen-size','video-bitrate','frame-rate','cidr-range','ip-calculator','throughput-calculator','bb-credit-calculator','latency-converter','data-size','bandwidth','tcp-throughput','bandwidth-delay-product'];

// discover slug paths from out/en
const enDir = 'out/en';
const slugMap = {};
for (const id of ids) {
  let found = null;
  const cats = fs.readdirSync(enDir);
  for (const cat of cats) {
    const p = `${enDir}/${cat}/${id}`;
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) { found = `${cat}/${id}`; break; }
  }
  slugMap[id] = found;
}

function get(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 0, body: '', err: e.message }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ status: 0, body: '', err: 'timeout' }); });
  });
}

let total = 0, ok = 0, fail = 0;
const failures = [];
const probeRE = /How (it works|to use)|guide|FAQ|步骤|使用方法|工作原理|Schritte|comment fonctionne|Cómo (funciona|usar)|仕組み|使い方/i;

for (const id of ids) {
  const slug = slugMap[id];
  if (!slug) { failures.push(`${id}: slug not found in out/en`); fail++; continue; }
  for (const lang of LANGS) {
    total++;
    const url = `${BASE}/${lang}/${slug}/`;
    const r = await get(url);
    const hasContent = r.body && probeRE.test(r.body);
    const pass = (r.status === 200) && hasContent;
    if (pass) ok++; else { fail++; failures.push(`${lang}/${id}: status=${r.status} content=${hasContent} (${r.err||''})`); }
  }
}
console.log(`\n=== BATCH8 ONLINE VERIFICATION ===`);
console.log(`total=${total} ok=${ok} fail=${fail}`);
if (failures.length) { console.log('--- FAILURES ---'); failures.forEach(f => console.log(f)); }
else console.log('ALL 186 PAGES 200 + GUIDE CONTENT ✅');
