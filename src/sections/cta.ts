import { CONTACT_EMAIL } from "@/config";

/** CTA — iletişim / teklif. */
export function renderCta(): string {
  return /* html */ `
  <section class="cta" id="iletisim">
    <div class="container">
      <div class="cta__row">
        <div class="cta__visual">
          <div class="cta__visual-frame"><img src="assets/footer1-dahafazla.jpg" alt="Daha Fazla" /></div>
          <span class="cta__visual-label">Daha Fazla</span>
        </div>
        <div class="cta__headline">
          <h2>ENERJİ YATIRIMINIZ<br />KORUMA ALTINDA</h2>
          <p>Elektrikli araç şarj istasyonlarınızı bugün kapsamlı teminatlarla güvence altına alın.</p>
        </div>
      </div>

      <div class="cta__bottom">
        <div class="cta__graphic">
          <img src="assets/footer2.jpg" alt="EV şarj konnektörü" />
        </div>
        <div class="cta__actions">
          <p class="cta__slogan">Hızlı. Güvenilir. Eksiksiz Teminat.</p>
          <div class="cta__btns">
            <a href="mailto:${CONTACT_EMAIL}" class="btn btn--light">
              <span class="btn__dot" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/></svg>
              </span>
              Teklif Al
            </a>
            <a href="#teminatlar" class="btn btn--ghost">
              <span class="btn__dot btn__dot--ghost" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
              </span>
              Teminatları İncele
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}
