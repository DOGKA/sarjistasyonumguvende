/**
 * SEO + AI dosyalarını üretir: public/sitemap.xml ve public/llms.txt
 *
 * - Statik sayfalar her zaman yazılır.
 * - Supabase erişilebilirse yayınlanmış blog yazıları da eklenir
 *   (anon ya da service_role anahtarı; env ya da admin/.env.local).
 * - Supabase yoksa/erişilemezse build'i KIRMAZ; sadece statik sayfalarla devam eder.
 *
 * Kullanım:
 *   node scripts/generate-seo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

const SITE_ORIGIN = "https://sarjistasyonumguvende.com";
const BRAND = "Şarj İstasyonum Güvende";

/* ----------------------------------------------- ortam değişkenleri (opsiyonel) */
function readEnvFile(path) {
  try {
    const out = {};
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return out;
  } catch {
    return {};
  }
}

const rootEnv = readEnvFile(join(ROOT, ".env"));
const adminEnv = readEnvFile(join(ROOT, "admin", ".env.local"));
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  rootEnv.VITE_SUPABASE_URL ||
  adminEnv.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  adminEnv.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  rootEnv.VITE_SUPABASE_ANON_KEY;

/* ------------------------------------------------------------- statik sayfalar */
const today = new Date().toISOString().slice(0, 10);

/** @type {{loc:string; priority:string; changefreq:string; lastmod?:string}[]} */
const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly", lastmod: today },
  { loc: "/hesaplayici.html", priority: "0.8", changefreq: "monthly", lastmod: today },
  { loc: "/karsilastir.html", priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: "/blog.html", priority: "0.7", changefreq: "weekly", lastmod: today },
  { loc: "/iletisim.html", priority: "0.6", changefreq: "monthly", lastmod: today },
  { loc: "/kullanim-kosullari.html", priority: "0.3", changefreq: "yearly", lastmod: today },
  { loc: "/gizlilik-politikasi.html", priority: "0.3", changefreq: "yearly", lastmod: today },
];

/* --------------------------------------------------- blog yazıları (Supabase) */
async function fetchPosts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[seo] Supabase anahtarı yok — yalnızca statik sayfalar eklenecek.");
    return [];
  }
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from("blog_posts")
      .select("title,slug,excerpt,published_at,created_at,noindex")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).filter((p) => p.slug && !p.noindex);
  } catch (err) {
    console.warn("[seo] Blog yazıları çekilemedi (build sürüyor):", err.message ?? err);
    return [];
  }
}

/* ------------------------------------------------------------------ yardımcılar */
const xmlEscape = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const postUrl = (slug) => `${SITE_ORIGIN}/blog.html?p=${encodeURIComponent(slug)}`;
const isoDate = (v) => (v ? new Date(v).toISOString().slice(0, 10) : today);

/* ----------------------------------------------------------------- sitemap.xml */
function buildSitemap(posts) {
  const urls = [];

  for (const p of staticPages) {
    urls.push(
      `  <url>\n` +
        `    <loc>${xmlEscape(SITE_ORIGIN + p.loc)}</loc>\n` +
        (p.lastmod ? `    <lastmod>${p.lastmod}</lastmod>\n` : "") +
        `    <changefreq>${p.changefreq}</changefreq>\n` +
        `    <priority>${p.priority}</priority>\n` +
        `  </url>`
    );
  }

  for (const post of posts) {
    urls.push(
      `  <url>\n` +
        `    <loc>${xmlEscape(postUrl(post.slug))}</loc>\n` +
        `    <lastmod>${isoDate(post.published_at ?? post.created_at)}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>0.6</priority>\n` +
        `  </url>`
    );
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>\n`
  );
}

/* -------------------------------------------------------------------- llms.txt */
function buildLlms(posts) {
  const lines = [];
  lines.push(`# ${BRAND}`);
  lines.push("");
  lines.push(
    `> Türkiye'de elektrikli araç (EV) şarj istasyonu işletmecileri için ` +
      `kapsamlı sigorta çözümleri sunan platform. Yangın, elektronik cihaz, ` +
      `makine kırılması, doğal afet, siber risk ve üçüncü şahıs mali ` +
      `sorumluluk teminatları; ücretsiz risk testi ve poliçe karşılaştırma araçları.`
  );
  lines.push("");
  lines.push(
    `Bu dosya yapay zekâ ajanları ve LLM tabanlı arama araçları içindir ` +
      `(llmstxt.org standardı). Tüm bilgiler ${SITE_ORIGIN} adresinden gelir.`
  );
  lines.push("");

  lines.push("## Sayfalar");
  lines.push("");
  lines.push(`- [Ana sayfa](${SITE_ORIGIN}/): EV şarj istasyonu sigortası genel tanıtım, teminatlar ve risk testi.`);
  lines.push(`- [Prim hesaplayıcı](${SITE_ORIGIN}/hesaplayici.html): Şarj istasyonu sigorta primi tahmin aracı.`);
  lines.push(`- [Poliçe karşılaştırma](${SITE_ORIGIN}/karsilastir.html): Sigorta poliçesi ve teminat karşılaştırması.`);
  lines.push(`- [Blog](${SITE_ORIGIN}/blog.html): EV şarj istasyonu sigortası, riskler ve mevzuat üzerine rehber yazılar.`);
  lines.push(`- [İletişim](${SITE_ORIGIN}/iletisim.html): Teklif ve danışmanlık için iletişim.`);
  lines.push("");

  if (posts.length) {
    lines.push("## Blog Yazıları");
    lines.push("");
    for (const post of posts) {
      const summary = (post.excerpt ?? "").replace(/\s+/g, " ").trim();
      lines.push(
        `- [${post.title}](${postUrl(post.slug)})` + (summary ? `: ${summary}` : "")
      );
    }
    lines.push("");
  }

  lines.push("## İletişim");
  lines.push("");
  lines.push(`- E-posta: info@sarjistasyonumguvende.com`);
  lines.push(`- Web: ${SITE_ORIGIN}`);
  lines.push("");

  return lines.join("\n");
}

/* ------------------------------------------------------------------------ main */
async function main() {
  mkdirSync(PUBLIC, { recursive: true });
  const posts = await fetchPosts();

  writeFileSync(join(PUBLIC, "sitemap.xml"), buildSitemap(posts), "utf8");
  writeFileSync(join(PUBLIC, "llms.txt"), buildLlms(posts), "utf8");

  console.log(
    `[seo] sitemap.xml + llms.txt yazıldı (${staticPages.length} statik + ${posts.length} blog URL).`
  );
}

main().catch((err) => {
  // Build'i asla kırma: sorun olsa bile statik dosyalarla devam et.
  console.warn("[seo] Beklenmeyen hata, statik içerikle devam:", err.message ?? err);
  try {
    mkdirSync(PUBLIC, { recursive: true });
    writeFileSync(join(PUBLIC, "sitemap.xml"), buildSitemap([]), "utf8");
    writeFileSync(join(PUBLIC, "llms.txt"), buildLlms([]), "utf8");
  } catch {
    /* yoksay */
  }
  process.exit(0);
});
