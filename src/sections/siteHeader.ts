interface SiteHeaderOptions {
  /**
   * "overlay" — şeffaf, hero videosunun üzerine biner (ana sayfa).
   * "solid"   — koyu, dolu çubuk (alt sayfalar).
   */
  variant?: "overlay" | "solid";
  /** Geçerli sayfaya karşılık gelen menü anahtarı (vurgu için). */
  active?: string;
}

interface NavLink {
  key: string;
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { key: "hakkimizda", href: "/#hakkimizda", label: "Hakkımızda" },
  { key: "teminatlar", href: "/#teminatlar", label: "Teminatlar" },
  { key: "cozumler", href: "/#cozumler", label: "Çözümler" },
  { key: "harita", href: "/#harita", label: "Harita" },
  { key: "risk", href: "/#risk-testi", label: "Risk Testi" },
  { key: "iletisim", href: "/iletisim.html", label: "İletişim" },
];

const MOBILE_NAV_LINKS: NavLink[] = [
  ...NAV_LINKS.slice(0, 5),
  { key: "hesaplayici", href: "/hesaplayici.html", label: "Maliyet Hesaplama" },
  ...NAV_LINKS.slice(5),
];

/**
 * Tüm sayfalarda ortak, sabit (sticky) üst başlık.
 * Aşağı kaydırıldığında `.is-scrolled` sınıfı eklenir (features/siteHeader.ts).
 * Mobilde hamburger + cam (glassmorphism) panel açılır (features/mobileMenu.ts).
 */
export function renderSiteHeader(opts: SiteHeaderOptions = {}): string {
  const variant = opts.variant ?? "solid";
  const links = NAV_LINKS.map(
    (l) =>
      `<a href="${l.href}"${l.key === opts.active ? ' class="is-active"' : ""}>${l.label}</a>`
  ).join("");
  const mobileLinks = MOBILE_NAV_LINKS.map(
    (l) =>
      `<a href="${l.href}" class="mobile-menu__link${
        l.key === opts.active ? " is-active" : ""
      }">${l.label}</a>`
  ).join("");

  return /* html */ `
  <header class="site-header site-header--${variant}" id="siteHeader">
    <div class="container site-header__row">
      <a href="/" class="site-header__logo" aria-label="Şarj İstasyonum Güvende — ana sayfa">
        <img src="assets/logos/dogalogo-white.svg" alt="Şarj İstasyonum Güvende" />
      </a>
      <nav class="site-header__menu" aria-label="Ana menü">
        ${links}
      </nav>
      <button type="button" class="site-header__burger" id="navBurger"
              aria-controls="mobileMenu" aria-expanded="false" aria-label="Menüyü aç">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu" hidden>
    <div class="mobile-menu__top">
      <a href="/" class="mobile-menu__logo" aria-label="Şarj İstasyonum Güvende — ana sayfa">
        <img src="/assets/logos/dogalogo-white.svg" alt="Şarj İstasyonum Güvende" />
      </a>
      <button type="button" class="mobile-menu__close" id="mobileMenuClose" aria-label="Menüyü kapat">
        <span></span><span></span>
      </button>
    </div>
    <nav class="mobile-menu__nav" aria-label="Mobil menü">
      ${mobileLinks}
    </nav>
    <div class="mobile-menu__foot">
      <button type="button" class="mm-tile" id="mmClock" aria-label="Sonraki şehir saati">
        <span class="mm-tile__name" id="mmClockCity">--</span>
        <span class="mm-tile__num" id="mmClockTime" data-tz="">--:--</span>
      </button>
      <button type="button" class="mm-tile" id="mmRate" aria-label="Sonraki parite">
        <span class="mm-tile__name" id="mmRateCode">--</span>
        <span class="mm-tile__num" id="mmRateVal">--</span>
      </button>
    </div>
  </div>`;
}
