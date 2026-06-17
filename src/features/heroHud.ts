import { qsOpt } from "@/lib/dom";

const STORAGE_KEY = "hero-hud:hidden";

/** Hero sağ HUD yığını (parite + saat) için göster/gizle düğmesi. */
export function initHeroHud(): void {
  const hud = qsOpt<HTMLDivElement>("#heroHud");
  const toggle = qsOpt<HTMLButtonElement>("#heroHudToggle");
  if (!hud || !toggle) return;

  function readStored(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function apply(hidden: boolean): void {
    hud!.classList.toggle("is-hidden", hidden);
    toggle!.setAttribute("aria-pressed", String(!hidden));
    toggle!.setAttribute("aria-label", hidden ? "Paneli göster" : "Paneli gizle");
    try {
      localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
    } catch {
      /* özel mod / kota — sorun değil */
    }
  }

  apply(readStored());

  toggle.addEventListener("click", () => {
    apply(!hud.classList.contains("is-hidden"));
  });
}
