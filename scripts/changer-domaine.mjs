// Usage : node scripts/changer-domaine.mjs nouveau-domaine.com [nouvelle-adresse@nouveau-domaine.com]
// Remplace le domaine (et, si fournie, l'adresse de contact) dans tout le site.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const [dom, mail] = process.argv.slice(2);
if (!dom) { console.error("Indiquez le nouveau domaine, sans https://"); process.exit(1); }
const OLD_DOM = "rediance.vercel.app", OLD_MAIL = "redianicegroup@gmail.com";
const EXT = new Set([".html", ".txt", ".xml", ".js", ".md", ".json", ".example"]);
let n = 0;
(function walk(d) {
  for (const f of readdirSync(d)) {
    if (f === "node_modules" || f === ".git" || f === "vendor") continue;
    const p = join(d, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!EXT.has(extname(f)) || p.endsWith("changer-domaine.mjs")) continue;
    const s = readFileSync(p, "utf8");
    let t = s.split(OLD_DOM).join(dom);
    if (mail) t = t.split(OLD_MAIL).join(mail);
    if (t !== s) { writeFileSync(p, t); n++; console.log("modifié :", p); }
  }
})(".");
console.log(n + " fichier(s) modifié(s). Pensez à mettre à jour RESEND_FROM et CONTACT_TO dans Vercel.");
