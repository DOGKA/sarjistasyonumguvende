/**
 * Şarj maliyet hesaplayıcısı için veri yükleyiciler.
 *
 * EV model veritabanı ve günlük şarj tarifeleri statik JSON dosyalarından
 * (public/data/*.json) çalışma zamanında çekilir. Tarifeler `scrape:prices`
 * npm script'i ile güncellenir.
 */
import type { ChargingPricesData, EvModelsData } from "@/types";

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

/** Güncel şarj operatörü tarifelerini yükler. */
export function loadChargingPrices(): Promise<ChargingPricesData> {
  return loadJson<ChargingPricesData>(CHARGING_PRICES_URL);
}
