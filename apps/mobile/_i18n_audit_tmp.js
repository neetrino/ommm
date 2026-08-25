const fs = require("fs");
const path = require("path");

const en = require("../web/src/messages/en.json");
const hy = require("../web/src/messages/hy.json");
const ru = require("../web/src/messages/ru.json");

function resolve(tree, key) {
  const parts = key.split(".");
  let cur = tree;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object" || !(p in cur)) return undefined;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (["node_modules", ".expo", "dist", "build"].includes(ent.name)) continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(ent.name) && !ent.name.endsWith(".d.ts")) {
      out.push(p);
    }
  }
  return out;
}

const root = path.join(__dirname);
const files = walk(root).filter(
  (p) => !p.includes("_i18n_audit_tmp") && !p.includes("\\i18n\\") && !p.includes("/i18n/"),
);

const found = [];
const missing = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const localNs = new Map();
  const nsAssigns = [
    ...text.matchAll(
      /(?:const|let)\s+(\w+)\s*=\s*useTranslations\(\s*(['"`])([^'"`]*)\2\s*\)/g,
    ),
  ];
  for (const m of nsAssigns) {
    localNs.set(m[1], m[3]);
  }

  for (const [varName, ns] of localNs) {
    const re = new RegExp(
      "\\b" + varName + "\\(\\s*(['\"`])([^'\"`]*)\\1",
      "g",
    );
    let m;
    while ((m = re.exec(text)) !== null) {
      const fullKey = ns ? `${ns}.${m[2]}` : m[2];
      const enVal = resolve(en, fullKey);
      const hyVal = resolve(hy, fullKey);
      const ruVal = resolve(ru, fullKey);
      const entry = {
        file: file.replace(/\\/g, "/").replace(/^.*\/apps\/mobile\//, "apps/mobile/"),
        varName,
        ns,
        key: m[2],
        fullKey,
        en: Boolean(enVal),
        hy: Boolean(hyVal),
        ru: Boolean(ruVal),
      };
      found.push(entry);
      if (!enVal) missing.push(entry);
    }
  }
}

const uniqMissing = new Map();
for (const e of missing) {
  if (!uniqMissing.has(e.fullKey)) uniqMissing.set(e.fullKey, e);
}

console.log("=== MISSING IN EN ===");
for (const e of uniqMissing.values()) {
  console.log(`${e.fullKey} | ${e.file} | via ${e.varName}("${e.key}") ns=${e.ns}`);
}
console.log(`\nTotal key call sites: ${found.length}`);
console.log(`Unique missing in en: ${uniqMissing.size}`);

const uniqFound = new Map();
for (const e of found) uniqFound.set(e.fullKey, e);

const hyMiss = [];
const ruMiss = [];
for (const [k, e] of uniqFound) {
  if (e.en && !e.hy) hyMiss.push(k);
  if (e.en && !e.ru) ruMiss.push(k);
}
console.log(`\n=== Missing HY (en ok): ${hyMiss.length} ===`);
hyMiss.forEach((k) => console.log(k));
console.log(`\n=== Missing RU (en ok): ${ruMiss.length} ===`);
ruMiss.forEach((k) => console.log(k));

// Also check formatMessage helpers that use absolute keys via t()
console.log("\n=== Absolute-key helpers ===");
for (const k of [
  "userPages.packages.validityExpired",
  "userPages.packages.validityDaysRemaining",
  "packagesPeriodDaysShort",
  "packagesValidityDays",
]) {
  console.log(
    k,
    "en=",
    Boolean(resolve(en, k)),
    "hy=",
    Boolean(resolve(hy, k)),
    "ru=",
    Boolean(resolve(ru, k)),
  );
}
