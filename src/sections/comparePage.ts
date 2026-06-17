/**
 * 07 — ELEKTRİKLİ ARAÇ KARŞILAŞTIRMA.
 * Hesaplayıcıdaki tüm marka ve modeller; aynı anda 3 araç dikey kıyaslanır.
 * Doldurma/etkileşim: features/compare.ts
 */
export function renderComparePage(): string {
  return /* html */ `
  <main class="cmp">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Araç Karşılaştırma</span>
        <a href="/hesaplayici.html" class="link-arrow">Maliyet Hesaplayıcı</a>
      </div>

      <div class="cmp__head">
        <h1>Elektrikli Araç<br />Karşılaştırma</h1>
        <div class="cmp__head-sub">
          <p>Maliyet hesaplayıcısındaki tüm marka ve modelleri batarya, menzil, tüketim ve şarj gücü gibi teknik özelliklerine göre yan yana kıyaslayın. Aynı anda 3 araca kadar seçebilirsiniz.</p>
          <span class="cmp__updated" id="cmpUpdated">Araçlar yükleniyor…</span>
        </div>
      </div>

      <div class="cmp__board-wrap">
        <div class="cmp__board" id="cmpBoard" role="table" aria-label="Araç teknik özellik karşılaştırması">
          <div class="cmp__board-skeleton">Karşılaştırma tablosu hazırlanıyor…</div>
        </div>
      </div>

      <p class="cmp__legend">
        <span class="cmp__legend-dot" aria-hidden="true"></span>
        Her satırda en iyi değer vurgulanır. Değerler üretici WLTP/teknik verilerinden derlenmiştir; bilgilendirme amaçlıdır.
      </p>
    </div>
  </main>`;
}
