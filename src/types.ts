/** Paylaşılan tip tanımları. */

/** Müşteri yorumu (Referanslar bölümü). */
export interface Review {
  /** Ad */
  n: string;
  /** Unvan */
  t: string;
  /** Yıldız (1-5) */
  s: number;
  /** Avatar görsel yolu */
  img: string;
  /** Yorum metni */
  q: string;
}

/** Risk testi seçeneği: [etiket, puan]. */
export type QuizOption = [label: string, score: number];

/** Risk testi sorusu. */
export interface QuizQuestion {
  q: string;
  o: QuizOption[];
}

/** Risk testi bölümü. */
export interface QuizSection {
  name: string;
  questions: QuizQuestion[];
}

/** Risk testi sonuç eşiği. */
export interface QuizResultTier {
  min: number;
  emoji: string;
  label: string;
  cls: string;
  desc: string;
}

/** Coğrafi konum. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** OpenChargeMap adres bilgisi (kısmi). */
export interface OcmAddressInfo {
  ID?: number;
  Title?: string;
  AddressLine1?: string;
  Town?: string;
  StateOrProvince?: string;
  Latitude: number;
  Longitude: number;
  Distance?: number;
  DistanceUnit?: number;
}

/** OpenChargeMap bağlantı/konnektör (kısmi). */
export interface OcmConnection {
  ConnectionType?: { Title?: string };
  PowerKW?: number;
}

/** OpenChargeMap POI (kısmi). */
export interface OcmPoi {
  ID: number;
  AddressInfo?: OcmAddressInfo;
  Connections?: OcmConnection[];
}
