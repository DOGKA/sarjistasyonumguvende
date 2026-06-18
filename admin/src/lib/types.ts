/** Veritabanı kayıt tipleri (Supabase tablolarıyla eşleşir). */

export type ContactStatus = "new" | "read" | "answered" | "archived";

export interface ContactSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  file_url: string | null;
  file_name: string | null;
  status: ContactStatus;
  admin_note: string | null;
}

/** Risk testinde tek bir cevap kaydı. */
export interface RiskAnswer {
  section: string;
  question: string;
  answer: string;
  points: number;
}

export interface RiskResult {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  score: number;
  tier: string | null;
  tier_label: string | null;
  answers: RiskAnswer[];
  total_questions: number | null;
}

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  author: string | null;
  tags: string[];
  status: BlogStatus;
  published_at: string | null;
  read_min: number | null;
  likes: number;

  /* SEO */
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  noindex: boolean;
}

/** Editör formundan gelen, kaydedilebilir blog alanları. */
export interface BlogPostInput {
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  author: string | null;
  tags: string[];
  status: BlogStatus;
  read_min: number | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  noindex: boolean;
}

export interface PageEvent {
  id: number;
  created_at: string;
  type: string;
  path: string | null;
  meta: Record<string, unknown> | null;
}

/* ----------------------------------------------- ŞARJ TARİFELERİ / KURLAR */

export type TariffType = "AC" | "DC";

/** Operatöre ait tek bir tarife kademesi (public/data/charging-prices.json). */
export interface ChargingTariff {
  type: TariffType;
  label: string;
  pricePerKwh: number;
}

/** Veri kaynağı: canlı çekildi mi yoksa yedek değer mi. */
export type PriceSource = "scraped" | "manual";

/** Tek bir şarj operatörü ve tarifeleri (canlı JSON'dan). */
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

/** charging_overrides tablosundaki bir satır (admin tarafından girilen). */
export interface ChargingOverride {
  operator_id: string;
  name: string | null;
  tariffs: ChargingTariff[];
  updated_at: string;
}

/** Tek bir döviz/altın kalemi (public/data/rates.json). */
export interface RateItem {
  code: string;
  name: string;
  symbol: string;
  buy: number | null;
  sell: number;
}

/** rates.json kök yapısı. */
export interface RatesData {
  date: string;
  lastUpdated: string;
  source: string;
  items: RateItem[];
}
