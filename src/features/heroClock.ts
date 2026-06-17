import { qsOpt, qs } from "@/lib/dom";
import { CLOCK_CITIES, clockSvgMarkup } from "@/sections/worldClocks";
import { tzOffsetMs, shadowPoints, rotate, HAND_LEN } from "@/features/worldClocks";

/**
 * Hero üzerindeki tek saat HUD'u (07 bölümündeki saatlerle aynı görünüm).
 * Varsayılan İstanbul; kullanıcı tıkladıkça sıradaki şehre geçer.
 */
export function initHeroClock(): void {
  const root = qsOpt<HTMLButtonElement>("#heroClock");
  if (!root) return;

  const face = qs<HTMLSpanElement>(".hero-clock__face", root);

  let index = 0;
  let tz = CLOCK_CITIES[index].tz;
  let offsetMs = tzOffsetMs(tz, new Date());

  let hands: { h: SVGLineElement; m: SVGLineElement; s: SVGLineElement };
  let shadows: { h: SVGPolygonElement; m: SVGPolygonElement; s: SVGPolygonElement };

  /** Seçili şehir için saat yüzünü yeniden çizer ve akrep referanslarını tazeler. */
  function build(): void {
    const c = CLOCK_CITIES[index];
    tz = c.tz;
    offsetMs = tzOffsetMs(tz, new Date());
    face.innerHTML = clockSvgMarkup(c, 99, true);
    root!.setAttribute("aria-label", `${c.city} saati — şehir değiştirmek için tıklayın`);

    hands = {
      h: qs<SVGLineElement>(".wclock__hand--h", face),
      m: qs<SVGLineElement>(".wclock__hand--m", face),
      s: qs<SVGLineElement>(".wclock__hand--s", face),
    };
    shadows = {
      h: qs<SVGPolygonElement>(".wclock__sh--h", face),
      m: qs<SVGPolygonElement>(".wclock__sh--m", face),
      s: qs<SVGPolygonElement>(".wclock__sh--s", face),
    };
    paint(Date.now());
  }

  function paint(now: number): void {
    const d = new Date(now + offsetMs);
    const h = d.getUTCHours();
    const m = d.getUTCMinutes();
    const s = d.getUTCSeconds();

    const secAngle = s * 6;
    const minAngle = (m + s / 60) * 6;
    const hourAngle = ((h % 12) + m / 60 + s / 3600) * 30;

    rotate(hands.s, secAngle);
    rotate(hands.m, minAngle);
    rotate(hands.h, hourAngle);

    shadows.s.setAttribute("points", shadowPoints(secAngle, HAND_LEN.s));
    shadows.m.setAttribute("points", shadowPoints(minAngle, HAND_LEN.m));
    shadows.h.setAttribute("points", shadowPoints(hourAngle, HAND_LEN.h));
  }

  build();

  // Tıkladıkça sıradaki şehre geç
  root.addEventListener("click", () => {
    index = (index + 1) % CLOCK_CITIES.length;
    build();
  });

  // Video üstündeki yeniden çizimi en aza indirmek için saniyede bir tikle
  // (her animasyon karesinde değil). Tik, gerçek saniye sınırına hizalanır.
  let timer = 0;

  function scheduleTick(): void {
    const delay = 1000 - (Date.now() % 1000);
    timer = window.setTimeout(() => {
      paint(Date.now());
      scheduleTick();
    }, delay);
  }

  function start(): void {
    if (timer) return;
    paint(Date.now());
    scheduleTick();
  }

  function stop(): void {
    if (timer) window.clearTimeout(timer);
    timer = 0;
  }

  // DST/ofset kaymalarına karşı dakikada bir tazele
  window.setInterval(() => {
    offsetMs = tzOffsetMs(tz, new Date());
  }, 60_000);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
}
