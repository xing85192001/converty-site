import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function findIdDir(id, locale = "en") {
  const base = `out/${locale}`;
  if (!fs.existsSync(base)) return null;
  for (const cat of fs.readdirSync(base)) {
    const p = path.join(base, cat, id);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      return p.split(path.sep).join("/").replace(/^out\//, "");
    }
  }
  return null;
}

const sample = [
  ["en", "student-loan"], ["en", "bmi"], ["en", "percent-error-calculator"],
  ["en", "time-duration"], ["en", "molecular-weight"], ["en", "rgb"],
  ["en", "pace-calculator"], ["en", "down-payment"], ["en", "random-number-calculator"],
  ["zh", "bmi"], ["zh-TW", "bmi"], ["de", "bmi"], ["ja", "bmi"], ["es", "bmi"],
  ["zh", "molecular-weight"], ["de", "molecular-weight"], ["ja", "molecular-weight"], ["es", "molecular-weight"]
];

let ok = 0, fail = 0;
const fails = [];
for (const [loc, id] of sample) {
  const rp = findIdDir(id, loc);
  if (!rp) { fail++; fails.push("PATH_MISSING " + loc + "/" + id); continue; }
  let code = "ERR";
  try {
    code = execSync(`curl -sL -o /dev/null -w "%{http_code}" --max-time 25 "https://www.baikecalc.com/${rp}/" || true`).toString().trim();
  } catch (e) { code = "CURLERR"; }
  if (code === "200") ok++;
  else { fail++; fails.push(code + "  " + rp); }
}
const out = `=== SAMPLE: ok=${ok}  fail=${fail}  (total ${sample.length}) ===\n` + (fails.length ? fails.join("\n") : "(all 200)");
process.stdout.write(out + "\n");
