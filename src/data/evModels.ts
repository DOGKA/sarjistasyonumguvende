/**
 * Şarj maliyet hesaplayıcısı için veri yükleyiciler.
 *
 * EV model veritabanı ve günlük şarj tarifeleri statik JSON dosyalarından
 * (public/data/*.json) çalışma zamanında çekilir. Tarifeler `scrape:prices`
 * npm script'i ile güncellenir.
 *
 * Tarifeler ek olarak Supabase `charging_overrides` tablosuyla zenginleştirilir:
 * admin panelinden bir operatör için değer girilmişse (örn. canlı çekme
 * başarısızsa), o değerler statik JSON'un üzerine uygulanır. Supabase yoksa
 * veya kayıt bulunmazsa JSON değerleri aynen kullanılır (sıfır regresyon).
 */
import { getSupabase } from "@/lib/supabase";
import type {
  ChargingPricesData,
  ChargingTariff,
  EvModelsData,
} from "@/types";

const EV_MODELS_URL = "/data/ev-models.json";
const CHARGING_PRICES_URL = "/data/charging-prices.json";

async function loadJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${url} yüklenemedi (HTTP ${res.status})`);
  return (await res.json()) as T;
}

/** EV marka/model veritabanını yükler. */
export function loadEvModels(): Promise<EvModelsData> {
  return loadJson<EvModelsData>(EV_MODELS_URL);
}

interface OverrideRow {
  operator_id: string;
  name: string | null;
  tariffs: ChargingTariff[] | null;
}

/** Geçerli (sayısal fiyatlı) tarife kademelerini süzer. */
function cleanTariffs(raw: ChargingTariff[] | null): ChargingTariff[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => ({
      type: t.type === "DC" ? "DC" : "AC",
      label: String(t.label ?? t.type ?? "").trim() || (t.type === "DC" ? "DC" : "AC"),
      pricePerKwh: Number(t.pricePerKwh),
    }))
    .filter((t) => Number.isFinite(t.pricePerKwh) && t.pricePerKwh > 0) as ChargingTariff[];
}

/**
 * Statik tarifelere Supabase override'larını uygular. Bir operatör için
 * override varsa o operatörün tarifeleri tamamen değiştirilir; JSON'da
 * bulunmayan operatör için yeni kayıt eklenir.
 */
async function applyOverrides(data: ChargingPricesData): Promise<ChargingPricesData> {
  try {
    const supabase = await getSupabase();
    if (!supabase) return data;

    const { data: rows, error } = await supabase
      .from("charging_overrides")
      .select("operator_id, name, tariffs");
    if (error || !rows || rows.length === 0) return data;

    const byId = new Map<string, OverrideRow>();
    for (const row of rows as OverrideRow[]) byId.set(row.operator_id, row);

    const operators = data.operators.map((op) => {
      const ov = byId.get(op.id);
      if (!ov) return op;
      const tariffs = cleanTariffs(ov.tariffs);
      if (!tariffs.length) return op;
      byId.delete(op.id);
      return { ...op, name: ov.name?.trim() || op.name, tariffs };
    });

    // JSON'da olmayan ama override'da tanımlı operatörleri de ekle
    for (const ov of byId.values()) {
      const tariffs = cleanTariffs(ov.tariffs);
      if (!tariffs.length) continue;
      operators.push({
        id: ov.operator_id,
        name: ov.name?.trim() || ov.operator_id,
        url: "",
        source: "scraped",
        tariffs,
      });
    }

    return { ...data, operators };
  } catch {
    return data; // ağ/yapılandırma hatası → statik değerlerle devam
  }
}

/** Güncel şarj operatörü tarifelerini yükler (Supabase override'ları uygulanır). */
export async function loadChargingPrices(): Promise<ChargingPricesData> {
  const data = await loadJson<ChargingPricesData>(CHARGING_PRICES_URL);
  return applyOverrides(data);
}
