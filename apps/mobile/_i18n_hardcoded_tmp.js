const fs = require("fs");
const path = require("path");

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (["node_modules", ".expo", "dist", "build"].includes(ent.name)) continue;
      walk(p, out);
    } else if (/\.(tsx)$/.test(ent.name)) {
      out.push(p);
    }
  }
  return out;
}

const SKIP_DIRS = [/[/\\]lib[/\\]api[/\\]/, /[/\\]theme[/\\]/, /[/\\]i18n[/\\]/];
const root = path.join(__dirname, "src");
const files = walk(root).filter((p) => !SKIP_DIRS.some((r) => r.test(p)));

// Also include app/ routes
const appRoot = path.join(__dirname, "app");
if (fs.existsSync(appRoot)) walk(appRoot, files);

const patterns = [
  // JSX text content roughly: >English words<
  { name: "jsxText", re: />\s*([A-Za-z][^<{]{2,80}?)\s*</g },
  // String literals assigned to UI props
  {
    name: "uiProp",
    re: /(title|label|placeholder|accessibilityLabel|accessibilityHint|message|description|subtitle|emptyTitle|emptyMessage|buttonLabel|confirmLabel|cancelLabel|headerTitle)\s*=\s*(?:\{)?\s*(["'`])([^"'`]+)\2/g,
  },
  // Alert.alert("...")
  { name: "alert", re: /Alert\.alert\(\s*(["'`])([^"'`]+)\1/g },
];

const IGNORE_EXACT = new Set([
  "Ommm",
  "AMD",
  "OK",
  "DD/MM/YYYY",
  "en",
  "hy",
  "ru",
]);

const IGNORE_RE = [
  /^https?:/i,
  /^[A-Z0-9_]+$/, // CONSTANTS
  /^#[0-9a-fA-F]+$/,
  /^\d/,
  /Bearer /,
  /Content-Type/,
  /application\//,
  /Manrope_/,
  /MaterialCommunityIcons/,
  /\.(tsx?|json|png|jpg)/,
  /^\$\{/,
  /^\/\//,
];

const results = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const rel = file.replace(/\\/g, "/").replace(/^.*\/apps\/mobile\//, "apps/mobile/");
  for (const { name, re } of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      let str;
      if (name === "jsxText") str = m[1].trim();
      else if (name === "alert") str = m[2];
      else str = m[3];
      if (!str || str.length < 3) continue;
      if (IGNORE_EXACT.has(str)) continue;
      if (IGNORE_RE.some((r) => r.test(str))) continue;
      // Skip if looks like code/expression leftover
      if (/[{}=<>]/.test(str)) continue;
      // Must have a letter space or multiple words-ish for jsx, or clear English
      if (!/[A-Za-z]/.test(str)) continue;
      results.push({ file: rel, kind: name, str: str.slice(0, 120) });
    }
  }
}

// Deduplicate
const seen = new Set();
const uniq = [];
for (const r of results) {
  const k = `${r.file}|${r.str}`;
  if (seen.has(k)) continue;
  seen.add(k);
  uniq.push(r);
}

uniq.sort((a, b) => a.file.localeCompare(b.file) || a.str.localeCompare(b.str));
console.log(`Found ${uniq.length} candidate hardcoded strings\n`);
for (const r of uniq) {
  console.log(`${r.file}\n  [${r.kind}] ${JSON.stringify(r.str)}`);
}
