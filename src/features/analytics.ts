/**
 * Google Analytics 4 yardımcıları.
 * gtag.js her sayfanın <head>'inde yüklenir; burada özel olayları
 * (dönüşümler) GA4'e göndermek için ince bir sarmalayıcı sunulur.
 */

type GtagArgs = [string, string, Record<string, unknown>?];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

/** GA4'e özel olay gönderir (gtag yüklü değilse sessizce yok sayar). */
export function trackEvent(
  name: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
