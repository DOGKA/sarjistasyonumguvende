/**
 * Public (tanıtım) sitesinin kök adresi.
 *
 * Admin paneli, canlı çekme durumunu görüntülemek için sitenin yayınladığı
 * statik JSON dosyalarını (örn. /data/charging-prices.json) bu adres üzerinden
 * okur. `NEXT_PUBLIC_SITE_URL` tanımlıysa o kullanılır; değilse prod adresine
 * düşülür.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sarjistasyonumguvende.com"
).replace(/\/$/, "");

/** Public sitedeki bir yola tam URL üretir (örn. "/data/rates.json"). */
export function siteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
