import { qsOpt } from "@/lib/dom";

/**
 * Hero arka plan videosu — poster anında görünür, video yalnızca
 * görünür olunca (veya ilk etkileşimde) yüklenip kesintisiz oynatılır.
 * LCP'yi yavaşlatmamak için kaynak `data-src` üzerinden tembel atanır.
 */
export function initHeroVideo(): void {
  const v = qsOpt<HTMLVideoElement>(".hero__bg");
  if (!v) return;

  v.muted = true;
  v.setAttribute("muted", "");

  let loaded = false;

  const tryPlay = (): void => {
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  const load = (): void => {
    if (loaded) return;
    const src = v.dataset.src;
    if (!src) return;
    loaded = true;
    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";
    v.appendChild(source);
    v.preload = "auto";
    v.load();
    tryPlay();
  };

  // Hero görünür olduğunda videoyu yükle.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(v);
  } else {
    load();
  }

  // İlk etkileşimde de yükle (otomatik oynatma engellenirse yedek).
  (["click", "touchstart", "scroll"] as const).forEach((ev) => {
    window.addEventListener(
      ev,
      () => {
        load();
        tryPlay();
      },
      { once: true, passive: true },
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && loaded) tryPlay();
  });
}
