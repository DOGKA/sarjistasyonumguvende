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

/**
 * Şirket / kurumsal bilgiler. Footer, yasal sayfalar ve (ileride) çerez
 * metinleri buradan beslenir. Boş alanlar müşteri bilgisi gelince doldurulacak.
 */
export const COMPANY = {
  /** Markanın görünen adı. */
  brand: "Şarj İstasyonum Güvende",
  /** Resmî ticaret ünvanı (TODO: müşteriden gelecek). */
  legalName: "",
  /** Açık adres (TODO: müşteriden gelecek). */
  address: "",
  /** Telefon — uluslararası ve görünen biçim (TODO: müşteriden gelecek). */
  phone: "",
  phoneHref: "",
  /** İletişim e-postası. */
  email: CONTACT_EMAIL,
} as const;

/* ----------------------------------------------------------------- SUPABASE */

/** Supabase proje URL'i (.env: VITE_SUPABASE_URL). */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? "";

/** Supabase anon (public) anahtarı (.env: VITE_SUPABASE_ANON_KEY). */
export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/**
 * Risk testi sonuçlarını kaydeden sunucu API'si (admin paneli).
 * Örn: http://localhost:8001/api/risk-results (dev) veya
 * https://panel.alanadiniz.com/api/risk-results (prod).
 * Tanımlıysa kayıt buraya POST edilir (RLS'ye takılmaz); tanımlı değilse
 * doğrudan Supabase'e (anon) yazmaya geri düşülür.
 */
export const RISK_API_URL: string = import.meta.env.VITE_RISK_API_URL ?? "";

/**
 * İletişim formu gönderimlerini kaydeden sunucu API'si (admin paneli).
 * Örn: http://localhost:8001/api/contact (dev) veya
 * https://panel.alanadiniz.com/api/contact (prod).
 * Tanımlıysa form buraya POST edilir (service role; RLS'ye takılmaz);
 * tanımlı değilse doğrudan Supabase'e (anon) yazmaya geri düşülür.
 */
export const CONTACT_API_URL: string =
  import.meta.env.VITE_CONTACT_API_URL ?? "";
