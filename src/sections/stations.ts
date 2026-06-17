/** 02 — ŞARJ HARİTASI (OpenChargeMap). İşlevsellik: features/map/ocmMap.ts */
export function renderStations(): string {
  return /* html */ `
  <section class="stations" id="harita">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">05 &nbsp;·&nbsp; Şarj Haritası</span>
        <a href="#iletisim" class="link-arrow">Teklif Al</a>
      </div>

      <div class="stations__head">
        <h2>Size En Yakın<br />Şarj İstasyonu</h2>
        <p>Harita üzerinde dilediğiniz gibi gezinin; yakındaki şarj noktalarını anlık olarak görün. Size <strong>en yakın</strong> istasyonu bulmak için bir şehir/adres yazın ya da konumunuzu paylaşın.</p>
      </div>

      <div class="stations__panel">
        <form class="stations__search" id="stationSearch" novalidate>
          <div class="stations__field">
            <label for="stCity">Konum <span>(opsiyonel)</span></label>
            <input type="text" id="stCity" name="city" placeholder="Şehir / adres — boş bırakırsanız konumunuz kullanılır" autocomplete="off" />
          </div>
          <button type="submit" class="stations__submit" id="stSubmit">En Yakın İstasyonu Bul</button>
          <p class="stations__error" id="stError" role="alert"></p>
        </form>

        <div class="stations__layout">
          <div class="stations__map" id="ocmMap" aria-label="Şarj istasyonları haritası"></div>
          <aside class="stations__list" id="stationList" aria-live="polite">
            <p class="stations__list-empty">Haritada gezinerek yakınızdaki şarj istasyonlarını keşfedin veya yukarıdan en yakın istasyonu aratın.</p>
          </aside>
        </div>
        <p class="stations__credit">Veri: <a href="https://openchargemap.org" target="_blank" rel="noopener">Open Charge Map</a> · Harita: OpenStreetMap</p>
      </div>
    </div>
  </section>`;
}
