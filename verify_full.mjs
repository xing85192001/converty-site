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

// 1) snapshot live paths from out/en NOW (before any build export rewrites out/)
const idToPath = {};
const base = "out/en";
for (const id of Object.keys(j.converter || {})) {
  for (const cat of fs.readdirSync(base)) {
    const p = path.join(base, cat, id);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      idToPath[id] = p.split(path.sep).join("/").replace(/^out\//, "");
      break;
    }
  }
}
fs.writeFileSync("verify_paths_snapshot.json", JSON.stringify(idToPath, null, 2));

// 2) live curl each guide tool (exclude batch7, not yet deployed)
const ids = [];
for (const [id, obj] of Object.entries(j.converter || {})) {
  if (obj && obj.guide && obj.guide.steps && obj.guide.steps.length > 0 && !batch7.has(id)) {
    ids.push(id);
  }
}

let ok = 0, fail = 0, localMissing = 0;
const fails = [];
for (const id of ids) {
  const rp = idToPath[id];
  if (!rp) { localMissing++; fails.push("LOCAL_MISSING " + id); continue; }
  let code = "ERR";
  try {
    code = execSync(`curl -sL -o /dev/null -w "%{http_code}" --max-time 25 "https://www.baikecalc.com/${rp}/" || true`).toString().trim();
  } catch (e) { code = "CURLERR"; }
  if (code === "200") ok++;
  else { fail++; fails.push(code + "  " + rp); }
}

const out =
  `=== FULL RESULT (excl. batch7): ok=${ok}  non200=${fail}  localMissing=${localMissing}  (total ${ids.length}) ===\n` +
  (fails.length ? fails.join("\n") : "(all 200)");
fs.writeFileSync("verify_full_result_v2.log", out);
process.stdout.write(out + "\n");
