/** 03 — NEDEN BİZ / Çözümler. */
export function renderSolutions(): string {
  return /* html */ `
  <section class="solutions" id="cozumler">
    <div class="container">
      <div class="solutions__head">
        <h2>Şarj İstasyonlarına Özel<br />Sigorta Çözümleri</h2>
        <div class="solutions__sub">
          <p>Hız, güvenilirlik ve eksiksiz teminatın her poliçede buluştuğu çözümler keşfedin.</p>
          <span class="eyebrow">03 &nbsp;·&nbsp; Neden Biz</span>
        </div>
      </div>

      <div class="solutions__cards">
        <article class="scard">
          <div class="scard__media">
            <img data-media="solutions_risk" src="assets/riskmuh1.jpg" alt="Risk mühendisliği ve analizi" />
            <span class="scard__pill">Risk Analizi</span>
          </div>
          <div class="scard__foot">
            <h3>Risk Mühendisliği</h3>
            <p>Termal kamera, SPD/RCD testleri ve topraklama ölçümleriyle hasar gerçekleşmeden önleyici risk analizi.</p>
          </div>
        </article>
        <article class="scard">
          <div class="scard__media">
            <img data-media="solutions_damage" src="assets/hatahasar1.jpg" alt="Hızlı hasar yönetimi" />
            <span class="scard__pill">Hasar</span>
          </div>
          <div class="scard__foot">
            <h3>Hızlı Hasar Yönetimi</h3>
            <p>Uzman eksper ağı ve hızlı süreç yönetimi ile elektronik kart ve güç modülü hasarlarında kesintisiz çözüm.</p>
          </div>
        </article>
      </div>
    </div>
  </section>`;
}
