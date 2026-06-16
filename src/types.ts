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

/* ----------------------------------------------- ŞARJ MALİYET HESAPLAYICI */

/** Tek bir elektrikli araç modeli (public/data/ev-models.json). */
export interface EvModel {
  model: string;
  /** Donanım/varyant (opsiyonel). */
  variant?: string;
  /** Kullanılabilir batarya kapasitesi (kWh). */
  usableBatteryKwh: number;
  /** Ortalama tüketim (kWh / 100 km). */
  avgConsumptionKwhPer100km: number;
  /** Maksimum AC şarj gücü (kW). */
  maxAcKw: number;
  /** Maksimum DC şarj gücü (kW). */
  maxDcKw: number;
  /** WLTP menzili (km) — biliniyorsa. */
  wltpRangeKm?: number;

  /* --- Genişletilmiş teknik özellikler (opsiyonel, karşılaştırma için) --- */
  /** Motor gücü (HP / PS). */
  powerHp?: number;
  /** 0–100 km/s hızlanma (saniye). */
  accel0to100s?: number;
  /** Maksimum hız (km/s). */
  topSpeedKph?: number;
  /** Boş ağırlık (kg). */
  weightKg?: number;
  /** Bagaj hacmi (L). */
  trunkL?: number;
  /** Koltuk sayısı. */
  seats?: number;
  /** Merkez multimedya ekran boyutu (inç). */
  screenInch?: number;
  /** Kamera sistemi açıklaması (örn. "360°"). */
  camera?: string;
  /** Sürüş asistanı / ADAS açıklaması. */
  adas?: string;
}

/** Bir marka ve modelleri. */
export interface EvBrand {
  id: string;
  name: string;
  /** Marka vurgu rengi (chip rozeti için). */
  color?: string;
  models: EvModel[];
}

/** ev-models.json kök yapısı. */
export interface EvModelsData {
  note?: string;
  brands: EvBrand[];
}

/** Şarj tarifesi tipi. */
export type TariffType = "AC" | "DC";

/** Operatöre ait tek bir tarife kademesi. */
export interface ChargingTariff {
  type: TariffType;
  label: string;
  pricePerKwh: number;
}

/** Veri kaynağı: canlı çekildi mi yoksa manuel mi girildi. */
export type PriceSource = "scraped" | "manual";

/** Tek bir şarj operatörü ve tarifeleri. */
export interface ChargingOperator {
  id: string;
  name: string;
  url: string;
  source: PriceSource;
  fetchedAt?: string;
  note?: string;
  tariffs: ChargingTariff[];
}

/** charging-prices.json kök yapısı. */
export interface ChargingPricesData {
  currency: string;
  lastUpdated: string;
  operators: ChargingOperator[];
}
