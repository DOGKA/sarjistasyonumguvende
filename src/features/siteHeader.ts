import { qsOpt } from "@/lib/dom";

/**
 * Ortak üst başlık davranışı.
 * Sayfa aşağı kaydıkça başlığa `.is-scrolled` sınıfı ekler; böylece
 * şeffaf (overlay) başlık dolu (solid) bir sticky çubuğa dönüşür.
 */
export function initSiteHeader(): void {
  const header = qsOpt<HTMLElement>("#siteHeader");
  if (!header) return;

  let ticking = false;

  function update(): void {
    header!.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  }

  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
}
