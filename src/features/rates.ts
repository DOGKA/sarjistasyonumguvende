import { qsOpt, qs, qsa, esc } from "@/lib/dom";
import type { RateItem, RatesData } from "@/types";

const RATES_URL = "/data/rates.json";
const STORAGE_KEY = "rate-select:code";

// Altın canlı: uluslararası ons fiyatı (USD/ons), CORS'a açık ücretsiz uç.
const GOLD_URL = "https://api.gold-api.com/price/XAU";
const GOLD_CODE = "GRAM_ALTIN";
const TROY_OUNCE_G = 31.1034768;
const GOLD_REFRESH_MS = 60_000; // sayfa açıkken dakikada bir tazele

const trFmt = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Bir kalemin güncel (satış) değerini "53,70" biçiminde döndürür (hepsi TL). */
function formatValue(item: RateItem): string {
  return trFmt.format(item.sell);
}

/** Pariteyi "USD/TL" biçiminde döndürür (gram altın → "ALTIN/TL"). */
function pairLabel(item: RateItem): string {
  return `${item.code === GOLD_CODE ? "ALTIN" : item.code}/TL`;
}

/** HUD arka planı için tek, ortak mockup fiyat serisi (tüm kurlarda aynı). */
const CHART_SERIES = [72, 66, 68, 58, 61, 50, 54, 43, 46, 34, 30];

/** Soluk, tek tonlu (renksiz) mum grafiği SVG'si döndürür (tüm kurlarda ortak). */
function chartSvg(): string {
  const data = CHART_SERIES;
  const n = data.length;
  const slot = 100 / n;
  const bodyW = slot * 0.5;
  let candles = "";
  for (let i = 0; i < n; i++) {
    const cx = slot * (i + 0.5);
    const close = data[i];
    const open = i === 0 ? close + 6 : data[i - 1];
    const top = Math.min(open, close);
    const bot = Math.max(open, close);
    const highY = Math.max(3, top - 7);
    const lowY = Math.min(97, bot + 7);
    const h = Math.max(1.6, bot - top);
    candles +=
      `<line x1="${cx.toFixed(1)}" y1="${highY.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${lowY.toFixed(1)}" stroke="rgba(0,0,0,.22)" stroke-width="1" />` +
      `<rect x="${(cx - bodyW / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${h.toFixed(1)}" rx="0.5" fill="rgba(0,0,0,.15)" />`;
  }
  return /* html */ `
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${candles}
    </svg>`;
}

const CHART_SVG = chartSvg();

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* özel mod / kota — sorun değil */
  }
}

/** Döviz & altın seçici (nav). Döviz günlük JSON'dan, altın canlı çekilir. */
export async function initRates(): Promise<void> {
  const root = qsOpt<HTMLDivElement>("#rateSelect");
  if (!root) return;

  let data: RatesData;
  try {
    const res = await fetch(RATES_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = (await res.json()) as RatesData;
  } catch {
    return; // veri yoksa seçici gizli kalır
  }

  const items = data.items?.filter((it) => Number.isFinite(it.sell)) ?? [];
  if (!items.length) return;

  const usdSell = items.find((it) => it.code === "USD")?.sell ?? null;

  const btn = qs<HTMLButtonElement>(".rate-select__btn", root);
  const codeEl = qs<HTMLSpanElement>(".rate-select__code", root);
  const valueEl = qs<HTMLSpanElement>(".rate-select__value", root);
  const bgEl = qsOpt<HTMLSpanElement>(".rate-select__bg", root);
  const menu = qs<HTMLUListElement>(".rate-select__menu", root);

  const stored = readStored();
  let activeCode = items.some((it) => it.code === stored) ? (stored as string) : items[0].code;

  btn.title = data.date ? `TCMB ${esc(data.date)} · kaynak: ${esc(data.source)}` : esc(data.source);

  menu.innerHTML = items
    .map(
      (it) => /* html */ `
      <li role="option" data-code="${esc(it.code)}" aria-selected="${it.code === activeCode}">
        <span class="rate-select__opt-name">
          ${esc(it.name)}${
            it.code === GOLD_CODE
              ? ' <span class="rate-select__dot" role="img" aria-label="Canlı"></span>'
              : ""
          }
        </span>
        <span class="rate-select__opt-val">${formatValue(it)}</span>
      </li>`
    )
    .join("");

  function render(): void {
    const item = items.find((it) => it.code === activeCode) ?? items[0];
    codeEl.textContent = pairLabel(item);
    valueEl.textContent = formatValue(item);
    if (bgEl) bgEl.innerHTML = CHART_SVG;
    for (const li of qsa<HTMLLIElement>("li[role=option]", menu)) {
      li.setAttribute("aria-selected", String(li.dataset.code === item.code));
      const it = items.find((x) => x.code === li.dataset.code);
      const val = li.querySelector<HTMLSpanElement>(".rate-select__opt-val");
      if (it && val) val.textContent = formatValue(it);
    }
  }

  function setOpen(open: boolean): void {
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    root!.classList.toggle("is-open", open);
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const i = items.findIndex((it) => it.code === activeCode);
    activeCode = items[(i + 1) % items.length].code;
    writeStored(activeCode);
    render();
  });

  menu.addEventListener("click", (e) => {
    const li = (e.target as HTMLElement).closest<HTMLLIElement>("li[role=option]");
    if (!li?.dataset.code) return;
    activeCode = li.dataset.code;
    writeStored(activeCode);
    render();
    setOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target as Node)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  render();
  root.hidden = false;

  /* ------------------------------------------------ altın: canlı tazeleme */
  const goldItem = items.find((it) => it.code === GOLD_CODE);
  if (goldItem && usdSell != null) {
    async function refreshGold(): Promise<void> {
      try {
        const res = await fetch(GOLD_URL, { cache: "no-cache" });
        if (!res.ok) return;
        const data = (await res.json()) as { price?: number };
        const ounceUsd = Number(data?.price);
        if (!Number.isFinite(ounceUsd)) return;
        const gram = Math.round((ounceUsd / TROY_OUNCE_G) * usdSell! * 100) / 100;
        if (gram > 0) {
          goldItem!.sell = gram;
          render();
        }
      } catch {
        /* ağ hatası — mevcut değer korunur */
      }
    }

    void refreshGold();
    const timer = window.setInterval(refreshGold, GOLD_REFRESH_MS);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) void refreshGold();
    });
    window.addEventListener("beforeunload", () => window.clearInterval(timer));
  }
}
