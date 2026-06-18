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
];

/**
 * Tüm sayfalarda ortak, sabit (sticky) üst başlık.
 * Aşağı kaydırıldığında `.is-scrolled` sınıfı eklenir (features/siteHeader.ts).
 */
export function renderSiteHeader(opts: SiteHeaderOptions = {}): string {
  const variant = opts.variant ?? "solid";
  const links = NAV_LINKS.map(
    (l) =>
      `<a href="${l.href}"${l.key === opts.active ? ' class="is-active"' : ""}>${l.label}</a>`
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
      <a href="/iletisim.html" class="site-header__cta${opts.active === "iletisim" ? " is-active" : ""}">İletişim</a>
    </div>
  </header>`;
}
