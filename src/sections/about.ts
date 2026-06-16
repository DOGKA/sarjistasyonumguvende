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
          <img class="about__img" src="assets/hakkimizda.png" alt="Şarj istasyonu ve sigorta danışmanlığı" />
          <div class="about__visual-labels">
            <span>Şarj Ünitesi</span>
            <span>Teminat</span>
          </div>
        </div>
        <div class="about__text">
          <h2>Şarj Altyapısında<br />Güvenin Öncüsü</h2>
          <p>Şarj istasyonları yalnızca bir elektrik ekipmanı değil; elektronik, haberleşme, yazılım ve enerji sistemlerinin birlikte çalıştığı kompleks tesislerdir. Bu kritik enerji yatırımlarını sürdürülebilir şekilde güvence altına alan çözümler sunuyoruz.</p>
        </div>
      </div>

      <div class="about__features">
        <article class="feature">
          <span class="feature__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
          <h3>Kanıtlanmış Tecrübe</h3>
          <p>8 yılı aşkın sektör tecrübesi ve binlerce sigortalanan şarj ünitesi ile elektrikli araç altyapısı sigortacılığında güvenilir bir referans noktasıyız.</p>
        </article>
        <article class="feature">
          <span class="feature__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3v18h18"/><path d="m7 14 3-4 3 3 5-7"/></svg>
          </span>
          <h3>Uzman Risk Yönetimi</h3>
          <p>Lokasyon, cihaz gücü, bakım geçmişi ve çevresel riskleri analiz ederek her istasyona özel, doğru kurgulanmış risk değerlendirmesi sağlıyoruz.</p>
        </article>
        <article class="feature">
          <span class="feature__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="M5 9h14l-2 11H7L5 9Z"/></svg>
          </span>
          <h3>Kapsamlı Teminatlar</h3>
          <p>Yangından elektronik cihaza, makine kırılmasından siber riske kadar şarj istasyonunun her bileşenini kapsayan eksiksiz teminat yapıları kuruyoruz.</p>
        </article>
      </div>
    </div>
  </section>`;
}
