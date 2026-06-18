/** Blog yardımcıları — hem sunucu action'ları hem editör (client) tarafından kullanılır. */

/** Başlıktan URL dostu slug üretir (Türkçe karakter duyarlı). */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u",
  };
  return input
    .trim()
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** HTML gövdeden düz metin çıkarır. */
export function htmlToText(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** HTML gövdeden ~200 kelime/dakika ile okuma süresi tahmini (dakika). */
export function estimateReadMin(html: string | null): number {
  const text = htmlToText(html);
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

/** Site kök adresi (canonical/OG üretimi için). */
export const SITE_ORIGIN = "https://www.sarjistasyonumguvende.com";

/** Slug'dan public blog detay URL'i üretir. */
export function postUrl(slug: string): string {
  return `${SITE_ORIGIN}/blog.html?p=${encodeURIComponent(slug)}`;
}
