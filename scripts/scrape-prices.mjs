#!/usr/bin/env node
/**
 * Günlük şarj tarifesi toplayıcısı (Playwright / headless tarayıcı).
 *
 * Türkiye'deki başlıca şarj operatörlerinin güncel TL/kWh tarifelerini
 * canlı sayfalardan çeker ve `public/data/charging-prices.json` dosyasına
 * yazar. Operatör siteleri fiyatları JS ile oluşturduğundan sayfa gerçek
 * bir tarayıcıyla (Chromium) render edilir; render sonrası metinden her
 * operatöre özel kurallarla AC / DC tarifeleri ayıklanır.
 *
 * Bir sayfadan akla yatkın fiyat çıkmazsa o operatör için koddaki manuel
 * referans değerlere düşülür ve `source: "manual"` olarak işaretlenir.
 * Bir operatör başarısız olsa bile script tamamı çökmez.
 *
 * Çalıştırma:
 *   npx playwright install chromium      (ilk kurulum, bir kez)
 *   node scripts/scrape-prices.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../public/data/charging-prices.json");

const NAV_TIMEOUT_MS = 45000;
const SETTLE_MS = 4000; // JS ile geç gelen fiyatlar için ek bekleme
const PRICE_MIN = 3;
const PRICE_MAX = 35;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/* ------------------------------------------------------------------ utils */

/** "7,49", "7.49", "₺7,49 /kWh" gibi metinlerden ondalık sayı üretir. */
function toNumber(raw) {
  if (raw == null) return null;
  let s = String(raw).replace(/[^\d.,]/g, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

const ok = (n) => n != null && n >= PRICE_MIN && n <= PRICE_MAX;

/** Etiketli (AC/DC) regex eşleşmelerini toplar → { ac:[], dc:[] }. */
function collect(flat, re) {
  const ac = [];
  const dc = [];
  let m;
  while ((m = re.exec(flat)) !== null) {
    const price = toNumber(m[2]);
    if (!ok(price)) continue;
    if (/ac/i.test(m[1])) ac.push(price);
    else dc.push(price);
  }
  return { ac, dc };
}

/** AC/DC fiyat listelerinden derli toplu bir tarife dizisi üretir. */
function assemble(ac, dc) {
  const tariffs = [];
  if (ac.length) tariffs.push({ type: "AC", label: "AC", pricePerKwh: Math.min(...ac) });
  if (dc.length) {
    const u = [...new Set(dc)].sort((a, b) => a - b);
    tariffs.push({ type: "DC", label: "DC", pricePerKwh: u[0] });
    if (u.length > 1 && u[u.length - 1] - u[0] >= 0.5) {
      tariffs.push({ type: "DC", label: "DC (hızlı)", pricePerKwh: u[u.length - 1] });
    }
  }
  return tariffs.length ? tariffs : null;
}

/** Son çare: AC/DC etiketi olmadan tüm kWh fiyatlarını sıralayıp eşler. */
function genericFallback(flat) {
  const re = /(\d{1,2}[.,]\d{1,2})\s*(?:₺|tl)\s*\/?\s*kw?h/gi;
  const prices = [];
  let m;
  while ((m = re.exec(flat)) !== null) {
    const n = toNumber(m[1]);
    if (ok(n)) prices.push(n);
  }
  const u = [...new Set(prices)].sort((a, b) => a - b);
  if (!u.length) return null;
  if (u.length === 1) return [{ type: "DC", label: "DC", pricePerKwh: u[0] }];
  if (u.length === 2)
    return [
      { type: "AC", label: "AC", pricePerKwh: u[0] },
      { type: "DC", label: "DC", pricePerKwh: u[1] },
    ];
  return [
    { type: "AC", label: "AC", pricePerKwh: u[0] },
    { type: "DC", label: "DC", pricePerKwh: u[1] },
    { type: "DC", label: "DC (hızlı)", pricePerKwh: u[u.length - 1] },
  ];
}

const nowIso = () =>
  new Date().toLocaleString("sv-SE", { timeZone: "Europe/Istanbul" }).replace(" ", "T") + "+03:00";

/* --------------------------------------------------------------- operators */

const OPERATORS = [
  {
    id: "trugo",
    name: "Trugo",
    url: "https://trugo.com.tr/price",
    // "AC Cihaz Fiyat Tarifesi 9,95 ₺" / "DC Cihaz Fiyat Tarifesi 14,98 ₺"
    parse: (flat) =>
      assemble(...vals(collect(flat, /(AC|DC)\s+Cihaz[^₺]{0,40}?(\d{1,2}[.,]\d{2})\s*₺/gi))),
    manual: [
      { type: "AC", label: "AC 22 kW", pricePerKwh: 8.99 },
      { type: "DC", label: "DC 180 kW", pricePerKwh: 11.49 },
    ],
    note: "Canlı sayfadan okunamadı; yedek referans değerler.",
  },
  {
    id: "zes",
    name: "ZES",
    url: "https://zes.net/tr/fiyatlandirma",
    // Etiketsiz: "9,99₺ kWh", "12,99₺ kWh", "16,49₺ kWh" → sıralı eşle
    parse: (flat) => {
      const re = /(\d{1,2}[.,]\d{2})\s*₺\s*\/?\s*kw?h/gi;
      const prices = [];
      let m;
      while ((m = re.exec(flat)) !== null) {
        const n = toNumber(m[1]);
        if (ok(n)) prices.push(n);
      }
      const u = [...new Set(prices)].sort((a, b) => a - b);
      if (!u.length) return null;
      if (u.length === 1) return [{ type: "DC", label: "DC", pricePerKwh: u[0] }];
      if (u.length === 2)
        return [
          { type: "AC", label: "AC", pricePerKwh: u[0] },
          { type: "DC", label: "DC", pricePerKwh: u[1] },
        ];
      return [
        { type: "AC", label: "AC", pricePerKwh: u[0] },
        { type: "DC", label: "DC", pricePerKwh: u[1] },
        { type: "DC", label: "DC (hızlı)", pricePerKwh: u[u.length - 1] },
      ];
    },
    manual: [
      { type: "AC", label: "AC 22 kW", pricePerKwh: 8.79 },
      { type: "DC", label: "DC 180+ kW", pricePerKwh: 11.79 },
    ],
    note: "Canlı sayfadan okunamadı; yedek referans değerler.",
  },
  {
    id: "voltrun",
    name: "Voltrun",
    url: "https://www.voltrun.com/tr/tarifeler",
    // "AC 9,90 TL / kWh" / "DC 12,90 TL / kWh" (işgaliye TL/dk hariç tutulur)
    parse: (flat) =>
      assemble(...vals(collect(flat, /\b(AC|DC)\s+(\d{1,2}[.,]\d{2})\s*TL\s*\/\s*kw?h/gi))),
    manual: [
      { type: "AC", label: "AC", pricePerKwh: 9.9 },
      { type: "DC", label: "DC", pricePerKwh: 12.9 },
    ],
    note: "Canlı sayfadan okunamadı; yedek referans değerler.",
  },
  {
    id: "tesla",
    name: "Tesla Supercharger",
    url: "https://www.tesla.com/tr_tr/support/charging/supercharger/fees",
    // Bu sayfa yalnızca bekleme/sıkışıklık ücretlerini listeler; kWh fiyatı
    // lokasyona göre değiştiğinden statik olarak yayınlanmaz → her zaman manuel.
    parse: () => null,
    manual: [
      { type: "DC", label: "Supercharger (üye olmayan)", pricePerKwh: 11.5 },
      { type: "DC", label: "Supercharger (üyelik)", pricePerKwh: 9.9 },
    ],
    note: "Supercharger kWh fiyatı lokasyona/zamana göre değişir; yedek referans değerler.",
  },
  {
    id: "shell",
    name: "Shell Recharge",
    url: "https://www.shell.com.tr/suruculer/shell-recharge-turkiye/fiyat-tarifesi.html",
    // "AC Şarj 11.99 TL" / "DC Şarj – 1 15.99 TL" / "DC Şarj – 2 13.50 TL"
    parse: (flat) =>
      assemble(...vals(collect(flat, /(AC|DC)\s*Şarj[^₺]{0,20}?(\d{1,2}[.,]\d{2})\s*TL/gi))),
    manual: [
      { type: "AC", label: "AC 22 kW", pricePerKwh: 8.69 },
      { type: "DC", label: "DC 180 kW", pricePerKwh: 11.39 },
    ],
    note: "Canlı sayfadan okunamadı; yedek referans değerler.",
  },
  {
    id: "wat",
    name: "Wat Mobilite",
    url: "https://www.watmobilite.com/cozumler/kamusal-alanlar#guncel-fiyat-ve-tarifeler",
    // "AC: 10.99 ₺/kWh" / "DC: 14.49 ₺/kWh"
    parse: (flat) =>
      assemble(...vals(collect(flat, /(AC|DC)\s*:?\s*(\d{1,2}[.,]\d{2})\s*₺\s*\/?\s*kw?h/gi))),
    manual: [
      { type: "AC", label: "AC 22 kW", pricePerKwh: 8.59 },
      { type: "DC", label: "DC 150 kW", pricePerKwh: 11.19 },
    ],
    note: "Canlı sayfadan okunamadı; manuel referans değerler.",
  },
];

/** collect() çıktısını assemble(ac, dc) argümanlarına çevirir. */
function vals(o) {
  return [o.ac, o.dc];
}

/* --------------------------------------------------------------------- run */

/** Yaygın çerez/onay banner'larını kapatmaya çalışır (varsa). */
async function dismissBanners(page) {
  const labels = [
    "Tümünü Kabul Et", "Kabul Et", "Kabul", "Onayla", "Accept all", "Accept",
    "Tamam", "Anladım", "İzin Ver",
  ];
  for (const label of labels) {
    try {
      const btn = page.getByRole("button", { name: new RegExp(label, "i") }).first();
      if (await btn.isVisible({ timeout: 700 })) {
        await btn.click({ timeout: 1500 });
        await page.waitForTimeout(400);
        break;
      }
    } catch {
      /* banner yok / tıklanamadı — sorun değil */
    }
  }
}

const MAX_ATTEMPTS = 3; // bot koruması / 429 için yeniden deneme sayısı

/**
 * Gerçek bir kullanıcı tarayıcısına benzeyen, headless tespitini zorlaştıran
 * bir bağlam üretir (bazı operatörler — örn. Voltrun — otomasyonu 429/403 ile
 * engeller; bu ayarlar engellenme olasılığını azaltır).
 */
async function newHardenedContext(browser) {
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
    viewport: { width: 1366, height: 900 },
    bypassCSP: true,
    extraHTTPHeaders: {
      "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Upgrade-Insecure-Requests": "1",
    },
  });
  // navigator.webdriver vb. otomasyon izlerini gizle
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", { get: () => ["tr-TR", "tr", "en-US"] });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
  });
  return context;
}

/** Sayfayı bir kez açar ve görünür metni döndürür (engel/zaman aşımında hata atar). */
async function fetchPageText(browser, op) {
  const context = await newHardenedContext(browser);
  const page = await context.newPage();
  try {
    const resp = await page.goto(op.url, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });
    const status = resp?.status() ?? 0;
    if (status === 429 || status === 403 || status >= 500) {
      throw new Error(`HTTP ${status} (engellendi)`);
    }
    await dismissBanners(page);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    // Fiyat benzeri metin (örn. "9,90 ₺" / "12.90 TL") belirene kadar bekle
    await page
      .waitForFunction(
        () => /\d{1,2}[.,]\d{2}\s*(₺|tl)/i.test(document.body?.innerText || ""),
        null,
        { timeout: 10000 }
      )
      .catch(() => {});
    await page.waitForTimeout(SETTLE_MS);
    return await page.evaluate(() => document.body?.innerText ?? "");
  } finally {
    await context.close();
  }
}

async function scrapeOperator(browser, op) {
  const fetchedAt = nowIso();
  let lastErr = "fiyat bulunamadı";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const text = await fetchPageText(browser, op);
      const flat = text.replace(/\s+/g, " ");
      const tariffs = op.parse(flat) ?? genericFallback(flat);

      if (tariffs && tariffs.length) {
        console.log(
          `✓ ${op.name.padEnd(22)} scraped → ` +
            tariffs.map((t) => `${t.label} ${t.pricePerKwh}`).join(", ")
        );
        return { id: op.id, name: op.name, url: op.url, source: "scraped", fetchedAt, tariffs };
      }
      lastErr = "fiyat bulunamadı";
    } catch (err) {
      lastErr = String(err?.message || err).split("\n")[0];
    }

    if (attempt < MAX_ATTEMPTS) {
      const waitMs = attempt * 5000; // artan bekleme (5s, 10s) — 429 için nazik
      console.log(
        `• ${op.name.padEnd(22)} deneme ${attempt}/${MAX_ATTEMPTS} başarısız (${lastErr}); ` +
          `${waitMs / 1000}s sonra tekrar`
      );
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  console.log(`✗ ${op.name.padEnd(22)} ${lastErr} → yedek değerler`);
  return {
    id: op.id,
    name: op.name,
    url: op.url,
    source: "manual",
    fetchedAt,
    note: op.note,
    tariffs: op.manual,
  };
}

async function main() {
  console.log("Şarj tarifeleri toplanıyor (Playwright)…\n");
  const browser = await chromium.launch({ headless: true });
  const operators = [];
  try {
    for (const op of OPERATORS) {
      operators.push(await scrapeOperator(browser, op));
    }
  } finally {
    await browser.close();
  }

  const payload = { currency: "TRY", lastUpdated: nowIso(), operators };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");

  const scraped = operators.filter((o) => o.source === "scraped").length;
  console.log(
    `\nKaydedildi: ${OUT_PATH}\n` +
      `${scraped}/${operators.length} operatör canlı çekildi, ${operators.length - scraped} manuel.`
  );
}

main().catch((err) => {
  console.error("Beklenmeyen hata:", err);
  process.exit(1);
});
