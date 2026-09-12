import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/app/[locale]");
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "page.tsx") files.push(p);
  }
})(root);

let changed = 0;
const needle = 'title: t("name"),';
const repl = 'title: `Free Online ${t("name")}`,';
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  if (s.includes(needle)) {
    fs.writeFileSync(f, s.replaceAll(needle, repl));
    changed++;
  }
}
console.log(`Changed ${changed} files out of ${files.length}`);
