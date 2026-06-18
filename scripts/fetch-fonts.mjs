// Inter fontunu (latin + latin-ext) Google Fonts'tan indirip self-host eder.
// Kullanım: node scripts/fetch-fonts.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const cssSrc = readFileSync("/tmp/inter.css", "utf8");
const outDir = resolve(root, "public/assets/fonts");
mkdirSync(outDir, { recursive: true });

const WANT = new Set(["latin", "latin-ext"]);
const blocks = cssSrc.split("/*").slice(1);
const faces = [];

for (const b of blocks) {
  const subset = b.slice(0, b.indexOf("*/")).trim();
  if (!WANT.has(subset)) continue;
  const weight = /font-weight:\s*(\d+)/.exec(b)?.[1];
  const url = /url\((https:[^)]+\.woff2)\)/.exec(b)?.[1];
  const range = /unicode-range:\s*([^;]+);/.exec(b)?.[1]?.trim();
  if (!weight || !url) continue;
  faces.push({ subset, weight, url, range });
}

const cssOut = [];
for (const f of faces) {
  const file = `inter-${f.weight}-${f.subset}.woff2`;
  const res = await fetch(f.url);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(resolve(outDir, file), buf);
  console.log(`indirildi: ${file} (${(buf.length / 1024).toFixed(1)} KB)`);
  cssOut.push(
    `@font-face{font-family:'Inter';font-style:normal;font-weight:${f.weight};font-display:swap;` +
      `src:url(/assets/fonts/${file}) format('woff2');unicode-range:${f.range};}`,
  );
}

const cssFile = resolve(root, "src/styles/fonts.css");
writeFileSync(
  cssFile,
  `/* Self-hosted Inter (latin + latin-ext) — Google Fonts render-blocking isteği kaldırıldı */\n` +
    cssOut.join("\n") +
    "\n",
);
console.log(`\n${faces.length} font yüzü yazıldı → src/styles/fonts.css`);
