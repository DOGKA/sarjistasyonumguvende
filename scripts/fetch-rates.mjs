#!/usr/bin/env node
/**
 * Günlük döviz & altın kuru toplayıcısı.
 *
 * Döviz kurları TCMB'nin resmi günlük XML bülteninden
 * (https://www.tcmb.gov.tr/kurlar/today.xml) okunur. TCMB altın yayınlamadığı
 * için gram altın, uluslararası ons fiyatından (gold-api.com, USD/ons) ve
 * TCMB USD satış kurundan hesaplanır:
 *     gram_altın_TL = (ons_USD / 31.1034768) * USD_satış_TL
 *
 * Sonuç `public/data/rates.json` dosyasına yazılır; site bu dosyayı same-origin
 * okur (tarayıcıda CORS sorunu olmaz). TCMB günde bir kez (~15:30) güncellendiği
 * için bu script'i günlük çalıştırmak yeterlidir.
 *
 * Çalıştırma:
 *   node scripts/fetch-rates.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../public/data/rates.json");

const TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
const GOLD_URL = "https://api.gold-api.com/price/XAU";
const TROY_OUNCE_G = 31.1034768;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Nav'da gösterilecek dövizler (TCMB kodu → görünen ad + sembol). */
const CURRENCIES = [
  { code: "USD", name: "Dolar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "Sterlin", symbol: "£" },
];

const nowIso = () =>
  new Date().toLocaleString("sv-SE", { timeZone: "Europe/Istanbul" }).replace(" ", "T") + "+03:00";

/** "53,7042" / "53.7042" → 53.7042 (number) | null. */
function toNumber(raw) {
  if (raw == null) return null;
  const n = parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.text();
}

/** TCMB XML'inden tek bir <Currency Kod="..."> bloğunu çeker. */
function currencyBlock(xml, code) {
  const re = new RegExp(`<Currency[^>]*Kod="${code}"[\\s\\S]*?</Currency>`, "i");
  const m = xml.match(re);
  return m ? m[0] : null;
}

function tagValue(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, "i"));
  return m ? m[1].trim() : null;
}

async function main() {
  console.log("Döviz & altın kurları toplanıyor…\n");

  const xml = await fetchText(TCMB_URL);
  const dateMatch = xml.match(/Tarih="([^"]+)"/);
  const date = dateMatch ? dateMatch[1] : "";

  const items = [];
  let usdSell = null;

  for (const cur of CURRENCIES) {
    const block = currencyBlock(xml, cur.code);
    if (!block) {
      console.log(`✗ ${cur.code.padEnd(4)} TCMB bülteninde bulunamadı, atlanıyor`);
      continue;
    }
    const buy = toNumber(tagValue(block, "ForexBuying"));
    const sell = toNumber(tagValue(block, "ForexSelling"));
    if (sell == null) {
      console.log(`✗ ${cur.code.padEnd(4)} satış kuru okunamadı, atlanıyor`);
      continue;
    }
    if (cur.code === "USD") usdSell = sell;
    items.push({ code: cur.code, name: cur.name, symbol: cur.symbol, buy, sell });
    console.log(`✓ ${cur.code.padEnd(4)} alış ${buy ?? "-"} / satış ${sell}`);
  }

  // Gram altın — uluslararası ons fiyatı × USD/TRY ÷ ons-gram
  if (usdSell != null) {
    try {
      const gold = JSON.parse(await fetchText(GOLD_URL));
      const ounceUsd = toNumber(gold?.price);
      if (ounceUsd != null) {
        const gram = Math.round((ounceUsd / TROY_OUNCE_G) * usdSell * 100) / 100;
        items.push({ code: "GRAM_ALTIN", name: "Gram Altın", symbol: "gr", buy: null, sell: gram });
        console.log(`✓ ALTN gram altın ≈ ${gram} TL (ons ${ounceUsd}$ × USD ${usdSell})`);
      }
    } catch (err) {
      console.log(`• Gram altın hesaplanamadı: ${String(err?.message || err).split("\n")[0]}`);
    }
  }

  if (!items.length) throw new Error("Hiçbir kur okunamadı");

  const payload = { date, lastUpdated: nowIso(), source: "TCMB · gold-api.com", items };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");

  console.log(`\nKaydedildi: ${OUT_PATH}\n${items.length} kalem (TCMB tarih: ${date}).`);
}

main().catch((err) => {
  console.error("Beklenmeyen hata:", err);
  process.exit(1);
});
