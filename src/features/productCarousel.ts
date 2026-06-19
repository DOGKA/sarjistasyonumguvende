import { qsOpt, qsa } from "@/lib/dom";

/** Teminat kart kaydırıcısı (04) — otomatik akış + el/mouse ile sürükleme + menü senkronu. */
export function initProductCarousel(): void {
  const track = qsOpt<HTMLDivElement>("#pcards");
  if (!track) return;

  const menuBtns = qsa<HTMLButtonElement>("#pmenu .pmenu");
  const dots = qsa<HTMLSpanElement>("#dots .dot");
  const carousel = track.closest<HTMLElement>(".product__carousel");

  const originals = Array.from(track.children);
  const total = originals.length;
  if (!total) return;

  // Sonsuz/pürüzsüz döngü için baştaki kartların kopyalarını sona ekle
  const clones = Math.min(3, total);
  for (let c = 0; c < clones; c++) {
    track.appendChild(originals[c].cloneNode(true));
  }

  const GAP = 22;
  let index = 0;
  let animating = false;
  let timer: number | null = null;

  // Sürükleme durumu
  let dragging = false;
  let pointerId: number | null = null;
  let startX = 0;
  let startOffset = 0;
  let dragDelta = 0;

  function stepWidth(): number {
    const card = track!.querySelector<HTMLElement>(".pcard");
    return card ? card.getBoundingClientRect().width + GAP : 0;
  }

  function realIndex(i: number): number {
    return ((i % total) + total) % total;
  }

  function move(i: number, animate: boolean): void {
    track!.style.transition = animate
      ? "transform .6s cubic-bezier(.22,.61,.36,1)"
      : "none";
    track!.style.transform = `translateX(${-stepWidth() * i}px)`;
  }

  function syncUI(real: number): void {
    menuBtns.forEach((b, bi) => b.classList.toggle("is-active", bi === real));
    dots.forEach((d, di) => d.classList.toggle("is-active", di === real));
  }

  function go(target: number): void {
    if (animating || dragging) return;
    animating = true;
    index = target;
    move(index, true);
    syncUI(realIndex(index));
  }

  track.addEventListener("transitionend", () => {
    animating = false;
    if (index >= total) {
      index -= total;
      move(index, false);
    } else if (index < 0) {
      index += total;
      move(index, false);
    }
  });

  menuBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.getAttribute("data-index") ?? "0", 10) || 0;
      go(i);
      restart();
    });
  });
  dots.forEach((d, di) => {
    d.addEventListener("click", () => {
      go(di);
      restart();
    });
  });

  // ---- El / mouse ile sürükleme (Pointer Events) ----
  function onPointerDown(e: PointerEvent): void {
    if (animating) return;
    dragging = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    startOffset = -stepWidth() * index;
    dragDelta = 0;
    track!.style.transition = "none";
    track!.setPointerCapture?.(e.pointerId);
    stop();
  }

  function onPointerMove(e: PointerEvent): void {
    if (!dragging || e.pointerId !== pointerId) return;
    dragDelta = e.clientX - startX;
    track!.style.transform = `translateX(${startOffset + dragDelta}px)`;

    // Sürüklerken üstteki CTA'ları (menü + noktalar) en yakın karta göre güncelle
    const sw = stepWidth();
    if (sw) {
      const approx = Math.round(-(startOffset + dragDelta) / sw);
      syncUI(realIndex(approx));
    }
  }

  function onPointerUp(e: PointerEvent): void {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;

    const sw = stepWidth();
    let target = index;
    if (sw) {
      target = Math.round(-(startOffset + dragDelta) / sw);
      // Küçük ama belirgin bir kaydırma da bir kart ilerletsin
      if (target === index && Math.abs(dragDelta) > 40) {
        target = index + (dragDelta < 0 ? 1 : -1);
      }
    }

    animating = true;
    index = target;
    move(index, true);
    syncUI(realIndex(index));
    restart();
  }

  track.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  function start(): void {
    if (dragging) return;
    timer = window.setInterval(() => go(index + 1), 3800);
  }
  function stop(): void {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }
  function restart(): void {
    stop();
    start();
  }

  if (carousel) {
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
  }
  window.addEventListener("resize", () => move(index, false));

  syncUI(0);
  move(0, false);
  start();
}
