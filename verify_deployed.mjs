import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const j = JSON.parse(fs.readFileSync("src/messages/en.json", "utf8"));
const batch7 = new Set([
  "ira-calculator", "bond-calculator", "annuity-calculator",
  "debt-snowball-avalanche", "stress-strain", "moment-of-inertia",
  "beam-deflection", "column-buckling", "pipe-flow",
  "engineering-unit-converter", "speed"
]);

const ids = [];
for (const [id, obj] of Object.entries(j.converter || {})) {
  if (obj && obj.guide && obj.guide.steps && obj.guide.steps.length > 0 && !batch7.has(id)) {
    ids.push(id);
  }
}

function findIdDir(id) {
  const base = "out/en";
  for (const cat of fs.readdirSync(base)) {
    const p = path.join(base, cat, id);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      return p.split(path.sep).join("/");
    }
  }
  return null;
}

let ok = 0, fail = 0, localMissing = 0;
const fails = [];
for (const id of ids) {
  const dir = findIdDir(id);
  if (!dir) { localMissing++; fails.push("LOCAL_MISSING " + id); continue; }
  const rp = dir.replace(/^out\//, "");
  let code = "ERR";
  try {
    code = execSync(`curl -sL -o /dev/null -w "%{http_code}" "https://www.baikecalc.com/${rp}/"`).toString().trim();
  } catch (e) { code = "CURLERR"; }
  if (code === "200") ok++;
  else { fail++; fails.push(code + "  " + rp); }
}

const out =
  `=== RESULT: ok=${ok}  non200=${fail}  localMissing=${localMissing}  (total ${ids.length}) ===\n` +
  (fails.length ? fails.join("\n") : "(all 200)");
fs.writeFileSync("verify_deployed_result.log", out);
process.stdout.write(out + "\n");
