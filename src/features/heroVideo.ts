import { qsOpt } from "@/lib/dom";

/** Hero arka plan videosu — kesintisiz otomatik oynatma. */
export function initHeroVideo(): void {
  const v = qsOpt<HTMLVideoElement>(".hero__bg");
  if (!v) return;

  v.muted = true;
  v.setAttribute("muted", "");

  const tryPlay = (): void => {
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  tryPlay();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryPlay();
  });
  (["click", "touchstart", "scroll"] as const).forEach((ev) => {
    window.addEventListener(ev, tryPlay, { once: true, passive: true });
  });
}
