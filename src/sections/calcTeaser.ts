/**
 * Şarj maliyeti hesaplayıcı yönlendirme bölümü.
 * Ana sayfadan ayrı hesaplayıcı sayfasına (/hesaplayici.html) yönlendirir.
 * Görsel: araç navigasyon ekranını andıran "rota kartı".
 */
export function renderCalcTeaser(): string {
  return /* html */ `
  <section class="calc-teaser" id="hesaplayici">
    <div class="container">
      <div class="calc-teaser__inner">
        <div class="calc-teaser__text">
          <span class="calc-teaser__eyebrow">04 &nbsp;·&nbsp; Maliyet Hesaplayıcı</span>
          <h2>Şarj maliyetinizi<br />önceden hesaplayın</h2>
          <p>Aracınızı seçin, şarj aralığını belirleyin; operatörlere göre tahmini şarj maliyetini ve eklenen menzili anında karşılaştırın.</p>
          <div class="calc-teaser__btns">
            <a href="/hesaplayici.html" class="btn btn--light">
              <span class="btn__dot" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
              </span>
              Maliyeti Hesapla
            </a>
            <a href="/karsilastir.html" class="btn btn--ghost">
              <span class="btn__dot btn__dot--ghost" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18V8m6 10V5m6 13v-7"/></svg>
              </span>
              Araçları Karşılaştır
            </a>
          </div>
        </div>

        <a class="calc-teaser__card" href="/hesaplayici.html" aria-label="Şarj maliyeti hesaplayıcı sayfasını aç">
          <div class="calc-teaser__card-head">
            <span class="calc-teaser__card-title">Şarj Maliyeti</span>
            <span class="calc-teaser__card-sub">
              Tesla · Model 3 · DC
            </span>
          </div>

          <div class="calc-teaser__route">
            <span class="calc-teaser__time">%20</span>
            <span class="calc-teaser__time calc-teaser__time--end">%80</span>
          </div>

          <div class="calc-teaser__bar" aria-hidden="true">
            <span class="calc-teaser__bar-base"></span>
            <span class="calc-teaser__bar-seg" style="--c:#5ad11d;--w:14%"></span>
            <span class="calc-teaser__bar-seg" style="--c:#e6442e;--w:9%"></span>
            <span class="calc-teaser__bar-seg" style="--c:#2fa636;--w:11%"></span>
            <span class="calc-teaser__bar-seg" style="--c:#d8f23a;--w:18%"></span>
            <svg class="calc-teaser__arrow" viewBox="0 0 40 40" aria-hidden="true">
              <path d="M2 6 L34 20 L2 34 L12 20 Z" fill="#d8f23a" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  </section>`;
}
