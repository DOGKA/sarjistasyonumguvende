import { qsOpt } from "@/lib/dom";
import { CLOCK_CITIES } from "@/sections/worldClocks";
import type { RatesData, RateItem } from "@/types";

const RATES_URL = "/data/rates.json";
const GOLD_CODE = "GRAM_ALTIN";
/** Parite döngüsünde öncelikli gösterilecek kodlar (sırayla). */
const RATE_CODES = ["USD", "EUR", GOLD_CODE];

const trFmt = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Mobil cam (glassmorphism) menü: hamburger ile açılır. En altta solda canlı
 * dünya saati, sağda döviz/altın paritesi gösterir; her iki kart da tıklandıkça
 * bir sonraki şehre / pariteye geçer. Tüm sayfalarda initSiteHeader() içinden çağrılır.
 */
export function initMobileMenu(): void {
  const burger = qsOpt<HTMLButtonElement>("#navBurger");
  const menu = qsOpt<HTMLElement>("#mobileMenu");
  if (!burger || !menu) return;

  const clockCity = qsOpt<HTMLElement>("#mmClockCity", menu);
  const clockTime = qsOpt<HTMLElement>("#mmClockTime", menu);
  const rateCode = qsOpt<HTMLElement>("#mmRateCode", menu);
  const rateVal = qsOpt<HTMLElement>("#mmRateVal", menu);

  let clockIndex = 0;
  let rates: RateItem[] = [];
  let rateIndex = 0;
  let clockTimer: number | null = null;
  let isOpen = false;

  function renderClock(): void {
    const c = CLOCK_CITIES[clockIndex];
    if (clockCity) clockCity.textContent = c.city;
    if (clockTime) clockTime.dataset.tz = c.tz;
    tickClock();
  }

  function tickClock(): void {
    if (!clockTime) return;
    const tz = clockTime.dataset.tz;
    if (!tz) return;
    try {
      clockTime.textContent = new Intl.DateTimeFormat("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: tz,
      }).format(new Date());
    } catch {
      /* geçersiz tz — atla */
    }
  }

  function renderRate(): void {
    if (!rates.length) return;
    const it = rates[rateIndex];
    if (rateCode) {
      rateCode.textContent = `${it.code === GOLD_CODE ? "ALTIN" : it.code}/TL`;
    }
    if (rateVal) rateVal.textContent = trFmt.format(it.sell);
  }

  async function loadRates(): Promise<void> {
    let data: RatesData;
    try {
      const res = await fetch(RATES_URL, { cache: "no-cache" });
      if (!res.ok) return;
      data = (await res.json()) as RatesData;
    } catch {
      return;
    }

    const items = (data.items ?? []).filter((it) => Number.isFinite(it.sell));
    if (!items.length) return;

    const byCode = new Map(items.map((it) => [it.code, it]));
    const picked: RateItem[] = RATE_CODES.map((code) => byCode.get(code)).filter(
      (it): it is RateItem => Boolean(it)
    );
    rates = picked.length ? picked : items;
    rateIndex = 0;
    renderRate();
  }

  function open(): void {
    if (isOpen) return;
    isOpen = true;
    menu!.hidden = false;
    // hidden kaldırıldıktan sonra reflow zorla; böylece açılış geçişi tetiklenir
    void menu!.offsetWidth;
    menu!.classList.add("is-open");
    burger!.setAttribute("aria-expanded", "true");
    burger!.setAttribute("aria-label", "Menüyü kapat");
    document.body.classList.add("mm-lock");

    tickClock();
    if (clockTimer === null) clockTimer = window.setInterval(tickClock, 1000);
  }

  function close(): void {
    if (!isOpen) return;
    isOpen = false;
    menu!.classList.remove("is-open");
    burger!.setAttribute("aria-expanded", "false");
    burger!.setAttribute("aria-label", "Menüyü aç");
    document.body.classList.remove("mm-lock");
    if (clockTimer !== null) {
      window.clearInterval(clockTimer);
      clockTimer = null;
    }
    const onEnd = (): void => {
      if (!isOpen) menu!.hidden = true;
      menu!.removeEventListener("transitionend", onEnd);
    };
    menu!.addEventListener("transitionend", onEnd);
  }

  // Menü açılmadan önce saat ve parite hazır olsun (ilk açılışta boş kalmasın).
  renderClock();
  void loadRates();

  burger.addEventListener("click", () => (isOpen ? close() : open()));
  qsOpt<HTMLButtonElement>("#mobileMenuClose", menu)?.addEventListener("click", close);

  qsOpt<HTMLButtonElement>("#mmClock", menu)?.addEventListener("click", () => {
    clockIndex = (clockIndex + 1) % CLOCK_CITIES.length;
    renderClock();
  });
  qsOpt<HTMLButtonElement>("#mmRate", menu)?.addEventListener("click", () => {
    if (!rates.length) return;
    rateIndex = (rateIndex + 1) % rates.length;
    renderRate();
  });

  // Bir bağlantıya tıklanınca menü kapanır
  menu.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".mobile-menu__link")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Masaüstüne genişletilirse menüyü kapat
  window.matchMedia("(min-width:901px)").addEventListener("change", (e) => {
    if (e.matches) close();
  });
}
