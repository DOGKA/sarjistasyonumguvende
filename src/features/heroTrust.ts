import { qsOpt, prefersReducedMotion } from "@/lib/dom";

/**
 * Hero teminat çipleri (01) — sürekli otomatik akış + el/mouse ile sürükleme.
 * Şerit kesintisiz dönsün diye çip listesi iki kez basılır; offset bir kopya
 * genişliği kadar ilerleyince başa sarılır. Hem web hem mobilde çalışır.
 */
export function initHeroTrust(): void {
  const viewport = qsOpt<HTMLElement>("#heroTrust");
  if (!viewport) return;
  const track = viewport.querySelector<HTMLElement>(".hero__trust-track");
  if (!track) return;

  // Kesintisiz döngü için içeriği ikiye katla (kopyalar ekran okuyuculardan gizli)
  const clones = Array.from(track.children).map((node) => {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });
  clones.forEach((c) => track.appendChild(c));

  const SPEED = 0.45; // px / frame (~60fps'te yumuşak akış)
  const reduced = prefersReducedMotion();

  let half = 0; // tek kopyanın genişliği
  let offset = 0;
  let paused = false;
  let raf = 0;

  // Sürükleme durumu
  let dragging = false;
  let pointerId: number | null = null;
  let startX = 0;
  let startOffset = 0;

  function measure(): void {
    half = track!.scrollWidth / 2;
  }

  function normalize(): void {
    if (half <= 0) return;
    while (offset <= -half) offset += half;
    while (offset > 0) offset -= half;
  }

  function apply(): void {
    track!.style.transform = `translateX(${offset}px)`;
  }

  function tick(): void {
    if (!paused && !dragging && !reduced) {
      offset -= SPEED;
      normalize();
      apply();
    }
    raf = requestAnimationFrame(tick);
  }

  // ---- El / mouse ile sürükleme (Pointer Events) ----
  function onPointerDown(e: PointerEvent): void {
    dragging = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    startOffset = offset;
    track!.classList.add("is-dragging");
    track!.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: PointerEvent): void {
    if (!dragging || e.pointerId !== pointerId) return;
    offset = startOffset + (e.clientX - startX);
    normalize();
    apply();
  }

  function onPointerUp(e: PointerEvent): void {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    track!.classList.remove("is-dragging");
  }

  track.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  // Masaüstünde üzerine gelince dursun
  viewport.addEventListener("mouseenter", () => {
    paused = true;
  });
  viewport.addEventListener("mouseleave", () => {
    paused = false;
  });

  window.addEventListener("resize", () => {
    measure();
    normalize();
    apply();
  });

  measure();
  apply();
  raf = requestAnimationFrame(tick);
  void raf;
}
