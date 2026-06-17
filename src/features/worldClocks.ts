import { qsOpt, qsa, qs, prefersReducedMotion } from "@/lib/dom";

const CENTER = 50;

// Long-shadow yönü (sağ-alt, 45°) ve uzunluğu (altıgenden taşacak kadar)
const SHADOW_DIR_X = Math.SQRT1_2;
const SHADOW_DIR_Y = Math.SQRT1_2;
const SHADOW_LEN = 90;

// Akrep / yelkovan / saniye uzunlukları (akis ucu merkeze uzaklık)
export const HAND_LEN = { h: 20, m: 28, s: 32 } as const;

interface ClockEls {
  tz: string;
  offsetMs: number;
  hands: { h: SVGLineElement; m: SVGLineElement; s: SVGLineElement };
  shadows: { h: SVGPolygonElement; m: SVGPolygonElement; s: SVGPolygonElement };
}

/**
 * Bir IANA zaman dilimi için UTC'ye göre ofseti (ms) hesaplar.
 * DST otomatik olarak hesaba katılır; ~dakikada bir tazelenir.
 */
export function tzOffsetMs(tz: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  let hour = map.hour;
  if (hour === 24) hour = 0; // bazı ortamlar gece yarısını "24" döndürür
  const asUTC = Date.UTC(map.year, map.month - 1, map.day, hour, map.minute, map.second);
  return asUTC - (date.getTime() - date.getMilliseconds());
}

/** Verilen açıdaki (derece, 12 = 0°, saat yönü) akrep için long-shadow poligonu. */
export function shadowPoints(angleDeg: number, len: number): string {
  const a = (angleDeg * Math.PI) / 180;
  const tx = CENTER + len * Math.sin(a);
  const ty = CENTER - len * Math.cos(a);
  const ox = SHADOW_DIR_X * SHADOW_LEN;
  const oy = SHADOW_DIR_Y * SHADOW_LEN;
  return `${CENTER},${CENTER} ${tx.toFixed(2)},${ty.toFixed(2)} ${(tx + ox).toFixed(2)},${(
    ty + oy
  ).toFixed(2)} ${(CENTER + ox).toFixed(2)},${(CENTER + oy).toFixed(2)}`;
}

export function rotate(line: SVGLineElement, angleDeg: number): void {
  line.setAttribute("transform", `rotate(${angleDeg.toFixed(3)} ${CENTER} ${CENTER})`);
}

/** Dünya saatleri — canlı analog (long-shadow) saatler (07 — Küresel Erişim). */
export function initWorldClocks(): void {
  const root = qsOpt<HTMLDivElement>("#worldClocks");
  if (!root) return;

  const cards = qsa<HTMLElement>(".wclock", root);
  if (!cards.length) return;

  const clocks: ClockEls[] = cards.map((card) => {
    const tz = card.dataset.tz || "UTC";
    return {
      tz,
      offsetMs: tzOffsetMs(tz, new Date()),
      hands: {
        h: qs<SVGLineElement>(".wclock__hand--h", card),
        m: qs<SVGLineElement>(".wclock__hand--m", card),
        s: qs<SVGLineElement>(".wclock__hand--s", card),
      },
      shadows: {
        h: qs<SVGPolygonElement>(".wclock__sh--h", card),
        m: qs<SVGPolygonElement>(".wclock__sh--m", card),
        s: qs<SVGPolygonElement>(".wclock__sh--s", card),
      },
    };
  });

  const smooth = !prefersReducedMotion();

  function paint(now: number): void {
    for (const c of clocks) {
      const d = new Date(now + c.offsetMs);
      const h = d.getUTCHours();
      const m = d.getUTCMinutes();
      const sRaw = d.getUTCSeconds();
      // Hareketli mod: saniye akıcı; azaltılmış hareket modunda tam saniye
      const s = smooth ? sRaw + d.getUTCMilliseconds() / 1000 : sRaw;

      const secAngle = s * 6;
      const minAngle = (m + s / 60) * 6;
      const hourAngle = ((h % 12) + m / 60 + s / 3600) * 30;

      rotate(c.hands.s, secAngle);
      rotate(c.hands.m, minAngle);
      rotate(c.hands.h, hourAngle);

      c.shadows.s.setAttribute("points", shadowPoints(secAngle, HAND_LEN.s));
      c.shadows.m.setAttribute("points", shadowPoints(minAngle, HAND_LEN.m));
      c.shadows.h.setAttribute("points", shadowPoints(hourAngle, HAND_LEN.h));
    }
  }

  let raf = 0;
  let lastTick = 0;

  function loop(): void {
    const now = Date.now();
    // Akıcı modda her kare; sakin modda saniyede bir
    if (smooth || now - lastTick >= 1000) {
      paint(now);
      lastTick = now;
    }
    raf = window.requestAnimationFrame(loop);
  }

  // DST/ofset kaymalarına karşı ofsetleri dakikada bir tazele
  window.setInterval(() => {
    const d = new Date();
    for (const c of clocks) c.offsetMs = tzOffsetMs(c.tz, d);
  }, 60_000);

  // Sekme görünür değilken animasyonu durdur (pil/performans)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      loop();
    }
  });

  paint(Date.now());
  loop();
}
