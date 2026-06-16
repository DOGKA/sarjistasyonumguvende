/**
 * Araç karşılaştırma yönlendirme bölümü.
 * Ana sayfadan ayrı karşılaştırma sayfasına (/karsilastir.html) yönlendirir.
 */
export function renderCompareTeaser(): string {
  return /* html */ `
  <section class="cmp-teaser" id="karsilastirma">
    <div class="container">
      <div class="cmp-teaser__inner">
        <div class="cmp-teaser__text">
          <span class="cmp-teaser__eyebrow">Daha Fazla</span>
          <h2>Elektrikli aracınızı<br />teknik özellikleriyle kıyaslayın</h2>
          <p>Batarya, menzil, tüketim ve şarj gücü… Maliyet hesaplayıcısındaki tüm marka ve modelleri aynı anda 3 araca kadar yan yana karşılaştırın.</p>
          <div class="cmp-teaser__btns">
            <a href="/karsilastir.html" class="btn btn--light">
              <span class="btn__dot" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18V8m6 10V5m6 13v-7"/></svg>
              </span>
              Araçları Karşılaştır
            </a>
            <a href="#hesaplayici" class="btn btn--ghost">
              <span class="btn__dot btn__dot--ghost" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
              </span>
              Maliyet Hesapla
            </a>
          </div>
        </div>

        <a class="cmp-teaser__cards" href="/karsilastir.html" aria-label="Araç karşılaştırma sayfasını aç">
          <div class="cmp-teaser__card" style="--accent:#e31937">
            <img class="cmp-teaser__car" src="assets/teslamodel.png" alt="Tesla Model 3" loading="lazy" />
            <div class="cmp-teaser__meta"><span>Tesla</span><b>Model 3</b><i>513 km</i></div>
          </div>
          <div class="cmp-teaser__card cmp-teaser__card--mid" style="--accent:#f06b1f">
            <img class="cmp-teaser__car" src="assets/toggmode.png" alt="Togg T10X" loading="lazy" />
            <div class="cmp-teaser__meta"><span>Togg</span><b>T10X</b><i>523 km</i></div>
          </div>
          <div class="cmp-teaser__card" style="--accent:#c9ccd1">
            <img class="cmp-teaser__car" src="assets/tiggomodel.png" alt="Chery Tiggo 7" loading="lazy" />
            <div class="cmp-teaser__meta"><span>Chery</span><b>Tiggo 7</b><i>480 km</i></div>
          </div>
        </a>
      </div>
    </div>
  </section>`;
}
