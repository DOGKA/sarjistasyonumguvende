/** 01 — HAKKIMIZDA. */
export function renderAbout(): string {
  return /* html */ `
  <section class="about" id="hakkimizda">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">01 &nbsp;·&nbsp; Hakkımızda</span>
        <a href="#iletisim" class="link-arrow">Hemen Başlayın</a>
      </div>

      <div class="about__grid">
        <div class="about__visual">
          <img class="about__img" data-media="about_main" src="assets/hakkimizda.webp" alt="Şarj istasyonu ve sigorta danışmanlığı" width="480" height="360" />
          <div class="about__visual-labels">
            <span>Şarj Ünitesi</span>
            <span>Teminat</span>
          </div>
        </div>
        <div class="about__text">
          <h2>Şarj İstasyonunuzu Beklenmedik<br />Risklere Karşı Koruyun</h2>
          <p>Elektrikli araç şarj istasyonları; yangın, yıldırım, araç çarpması, hırsızlık, vandalizm ve elektronik arızalar nedeniyle ciddi mali kayıplarla karşılaşabilir. Şarj istasyonlarına özel sigorta çözümlerimizle ekipmanlarınızı, gelirlerinizi ve işletmenizi güvence altına alıyoruz.</p>
        </div>
      </div>

      <div class="about__features">
        <article class="feature">
          <span class="feature__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
          <h3>Gerçek Riskler</h3>
          <p>Yangın, araç çarpması, hırsızlık ve elektronik arızalar gibi şarj altyapısına özel risklere karşı koruma.</p>
        </article>
        <article class="feature">
          <span class="feature__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3v18h18"/><path d="m7 14 3-4 3 3 5-7"/></svg>
          </span>
          <h3>Özelleştirilmiş Teminatlar</h3>
          <p>AC ve DC şarj üniteleri, enerji depolama sistemleri ve yardımcı ekipmanlar için özel çözümler.</p>
        </article>
        <article class="feature">
          <span class="feature__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="M5 9h14l-2 11H7L5 9Z"/></svg>
          </span>
          <h3>Hızlı Teklif ve Destek</h3>
          <p>Uzman ekibimiz risk analizi yaparak kısa sürede teklif sunar ve hasar süreçlerinde yanınızda olur.</p>
        </article>
      </div>
    </div>
  </section>`;
}
