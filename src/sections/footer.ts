import { COMPANY } from "@/config";

/** Sol blok için marka açıklaması. */
const TAGLINE =
  "Elektrikli araç şarj istasyonlarınız için kapsamlı, güvenilir ve uzman sigorta çözümleri.";

/** Footer'daki "Keşfet" sütunu — ana sayfa bölümlerine bağlar. */
const EXPLORE_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/#teminatlar", label: "Teminatlar" },
  { href: "/#cozumler", label: "Çözümler" },
  { href: "/#harita", label: "Harita" },
  { href: "/#risk-testi", label: "Risk Testi" },
];

/** Kurumsal / yasal sayfalar. */
const CORPORATE_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/iletisim.html", label: "İletişim" },
  { href: "/#blog", label: "Blog" },
  { href: "/kullanim-kosullari.html", label: "Kullanım Koşulları" },
  { href: "/gizlilik-politikasi.html", label: "Gizlilik Politikası" },
];

/** Değer doluysa iletişim satırı üretir; boşsa hiçbir şey basmaz. */
function contactRow(label: string, value: string, href?: string): string {
  if (!value) return "";
  const inner = href ? `<a href="${href}">${value}</a>` : `<span>${value}</span>`;
  return /* html */ `
    <li>
      <span class="footer__contact-label">${label}</span>
      ${inner}
    </li>`;
}

/** FOOTER. */
export function renderFooter(): string {
  const year = new Date().getFullYear();

  const exploreLinks = EXPLORE_LINKS.map(
    (l) => `<a href="${l.href}">${l.label}</a>`
  ).join("");

  const corporateLinks = CORPORATE_LINKS.map(
    (l) => `<a href="${l.href}">${l.label}</a>`
  ).join("");

  const contactRows = [
    contactRow("E-posta", COMPANY.email, `mailto:${COMPANY.email}`),
    contactRow("Telefon", COMPANY.phone, COMPANY.phoneHref || undefined),
    contactRow("Adres", COMPANY.address),
  ].join("");

  return /* html */ `
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <img class="footer__logo" src="assets/logos/dogalogo-white.svg" alt="${COMPANY.brand}" />
          <p class="footer__tagline">${TAGLINE}</p>
          <a class="footer__cta" href="/iletisim.html">
            Teklif Al
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>

        <nav class="footer__cols" aria-label="Alt menü">
          <div class="footer__col">
            <h4 class="footer__col-title">Keşfet</h4>
            <div class="footer__col-links">${exploreLinks}</div>
          </div>
          <div class="footer__col">
            <h4 class="footer__col-title">Kurumsal</h4>
            <div class="footer__col-links">${corporateLinks}</div>
          </div>
          <div class="footer__col footer__col--contact">
            <h4 class="footer__col-title">İletişim</h4>
            <ul class="footer__contact">${contactRows}</ul>
          </div>
        </nav>
      </div>

      <div class="footer__bottom">
        <span class="footer__copy">© ${year} ${COMPANY.brand}. Tüm hakları saklıdır.</span>
        <div class="footer__legal">
          <a href="/kullanim-kosullari.html">Kullanım Koşulları</a>
          <a href="/gizlilik-politikasi.html">Gizlilik Politikası</a>
        </div>
      </div>

      <div class="footer__credit">
        <span>Developed by <a href="https://juststack.co/" target="_blank" rel="noopener noreferrer">Juststack Software and Technology LLC</a></span>
      </div>
    </div>
  </footer>`;
}
