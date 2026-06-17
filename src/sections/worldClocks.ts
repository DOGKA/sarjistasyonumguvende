import { esc } from "@/lib/dom";

export interface ClockCity {
  city: string;
  tz: string;
  lat: number;
  lon: number;
}

/** Dünya saatleri kartlarında gösterilecek şehirler (soldan sağa). */
export const CLOCK_CITIES: ClockCity[] = [
  { city: "İstanbul", tz: "Europe/Istanbul", lat: 41.0082, lon: 28.9784 },
  { city: "Londra", tz: "Europe/London", lat: 51.5074, lon: -0.1278 },
  { city: "New York", tz: "America/New_York", lat: 40.7128, lon: -74.006 },
  { city: "Dubai", tz: "Asia/Dubai", lat: 25.2048, lon: 55.2708 },
];

// Pointy-top altıgen köşeleri (viewBox 0 0 100 100, merkez 50,50, r=40)
const HEX_POINTS = "50,10 84.64,30 84.64,70 50,90 15.36,70 15.36,30";

// OpenStreetMap karo (tile) ayarları — altıgen içine gömülü mini harita
const TILE_Z = 10; // şehir/metropol ölçeği
const TILE_DISP = 80; // viewBox biriminde tek karonun gösterim boyutu

/** Şehir koordinatını merkezleyen 3×3 OSM karo mozaiği üretir (statik markup). */
function mapTiles(lat: number, lon: number): string {
  const n = 2 ** TILE_Z;
  const world = 256 * n;
  const gx = ((lon + 180) / 360) * world;
  const latRad = (lat * Math.PI) / 180;
  const gy = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * world;

  const ctx = Math.floor(gx / 256);
  const cty = Math.floor(gy / 256);
  const fracX = gx / 256 - ctx;
  const fracY = gy / 256 - cty;

  const imgs: string[] = [];
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const tx = (((ctx + i) % n) + n) % n;
      const ty = cty + j;
      if (ty < 0 || ty >= n) continue;
      const sx = 50 - fracX * TILE_DISP + i * TILE_DISP;
      const sy = 50 - fracY * TILE_DISP + j * TILE_DISP;
      const url = `https://tile.openstreetmap.org/${TILE_Z}/${tx}/${ty}.png`;
      imgs.push(
        `<image href="${url}" x="${sx.toFixed(2)}" y="${sy.toFixed(2)}" width="${(
          TILE_DISP + 0.6
        ).toFixed(2)}" height="${(TILE_DISP + 0.6).toFixed(2)}" preserveAspectRatio="none" />`
      );
    }
  }
  return imgs.join("");
}

/**
 * Saat yüzünün iç SVG'si (harita + çerçeve + akrepler). Hero HUD ile paylaşılır.
 * `round=true` ise dış hat altıgen yerine daire olur.
 */
export function clockSvgMarkup(c: ClockCity, i: number, round = false): string {
  const clip = `wc-clip-${i}`;
  const shape = (cls: string): string =>
    round
      ? `<circle class="${cls}" cx="50" cy="50" r="40" />`
      : `<polygon class="${cls}" points="${HEX_POINTS}" />`;
  const clipShape = round
    ? `<circle cx="50" cy="50" r="40" />`
    : `<polygon points="${HEX_POINTS}" />`;
  return /* html */ `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <clipPath id="${clip}">${clipShape}</clipPath>
        </defs>
        ${shape("wclock__base")}
        <g class="wclock__map" clip-path="url(#${clip})">
          ${mapTiles(c.lat, c.lon)}
          ${shape("wclock__veil")}
        </g>
        ${shape("wclock__hex")}
        <text class="wclock__label" x="50" y="42" text-anchor="middle">${esc(c.city)}</text>
        <g class="wclock__shadow" clip-path="url(#${clip})">
          <polygon class="wclock__sh wclock__sh--h" points="50,50 50,50 50,50" />
          <polygon class="wclock__sh wclock__sh--m" points="50,50 50,50 50,50" />
          <polygon class="wclock__sh wclock__sh--s" points="50,50 50,50 50,50" />
        </g>
        <line class="wclock__hand wclock__hand--h" x1="50" y1="50" x2="50" y2="30" />
        <line class="wclock__hand wclock__hand--m" x1="50" y1="50" x2="50" y2="22" />
        <line class="wclock__hand wclock__hand--s" x1="50" y1="50" x2="50" y2="18" />
        <circle class="wclock__pin" cx="50" cy="50" r="2.4" />
      </svg>`;
}

/** Tek bir analog saat kartı (long-shadow + şehir haritası). */
function renderClock(c: ClockCity, i: number): string {
  return /* html */ `
  <article class="wclock" data-tz="${esc(c.tz)}" role="img" aria-label="${esc(c.city)} saati">
    <div class="wclock__face">
      ${clockSvgMarkup(c, i)}
    </div>
  </article>`;
}

/** 07 — DÜNYA SAATLERİ. İşlevsellik: features/worldClocks.ts */
export function renderWorldClocks(): string {
  return /* html */ `
  <section class="wclocks" id="dunya-saatleri">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">07 &nbsp;·&nbsp; Küresel Erişim</span>
        <a href="#iletisim" class="link-arrow">İletişime Geç</a>
      </div>

      <div class="wclocks__head">
        <h2>Dünyanın Her Yerinde<br />Aynı Saatte Yanınızdayız</h2>
        <p>Farklı zaman dilimlerindeki iş ortaklarımız ve müşterilerimiz için 7/24 kesintisiz danışmanlık. Aşağıdaki saatler canlı olarak çalışır.</p>
      </div>

      <div class="wclocks__track" id="worldClocks">
        ${CLOCK_CITIES.map(renderClock).join("\n")}
      </div>

      <p class="wclocks__credit">Harita: <a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> katkıda bulunanları</p>
    </div>
  </section>`;
}
