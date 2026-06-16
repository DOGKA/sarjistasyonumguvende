/** Uygulama yapılandırması — ortam değişkenleri ve sabitler. */

/** OpenChargeMap API anahtarı (.env: VITE_OCM_API_KEY). */
export const OCM_API_KEY: string = import.meta.env.VITE_OCM_API_KEY ?? "";

/** OpenChargeMap POI uç noktası. */
export const OCM_BASE = "https://api.openchargemap.io/v3/poi/";

/** OpenStreetMap Nominatim geocode uç noktası. */
export const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

/** Harita başlangıç görünümü (Türkiye geneli). */
export const MAP_DEFAULT_CENTER: [number, number] = [39.0, 35.2];
export const MAP_DEFAULT_ZOOM = 6;

/** İletişim e-postası. */
export const CONTACT_EMAIL = "info@sarjistasyonumguvende.com";
