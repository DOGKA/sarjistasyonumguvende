/** 04 — TEMİNATLAR (koyu). İşlevsellik: features/productCarousel.ts */
export function renderProduct(): string {
  return /* html */ `
  <section class="product" id="teminatlar">
    <div class="container">
      <div class="product__top">
        <div class="product__intro">
          <div class="product__intro-frame" id="introFrame"><img src="assets/kapsamlikoruma.jpg" alt="Kapsamlı Koruma" /></div>
          <span class="product__intro-label">Kapsamlı Koruma</span>
        </div>
        <div class="product__title">
          <h2>İhtiyacınıza Uygun<br />Teminat Paketleri</h2>
          <span class="eyebrow eyebrow--light">02 &nbsp;·&nbsp; Teminatlar</span>
        </div>
      </div>

      <div class="product__body">
        <div class="product__menu" id="pmenu">
          <button class="pmenu is-active" data-index="0">Yangın Teminatı <span class="pmenu__arrow">→</span></button>
          <button class="pmenu" data-index="1">Makine Kırılması <span class="pmenu__arrow">→</span></button>
          <button class="pmenu" data-index="2">Doğal Afet <span class="pmenu__arrow">→</span></button>
          <button class="pmenu" data-index="3">Siber Risk <span class="pmenu__arrow">→</span></button>
          <button class="pmenu" data-index="4">Elektronik Cihaz <span class="pmenu__arrow">→</span></button>
        </div>

        <div class="product__carousel">
          <div class="pcards" id="pcards">
            <article class="pcard">
              <div class="pcard__media"><img src="assets/yanginteminati.jpg" alt="Yangın Teminatı" /></div>
              <div class="pcard__foot">
                <span>Yangın Teminatı</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
            <article class="pcard">
              <div class="pcard__media"><img src="assets/makinakirilmasi.jpg" alt="Makine Kırılması" /></div>
              <div class="pcard__foot">
                <span>Makine Kırılması</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
            <article class="pcard">
              <div class="pcard__media"><img src="assets/dogalafet.jpg" alt="Doğal Afet" /></div>
              <div class="pcard__foot">
                <span>Doğal Afet</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
            <article class="pcard">
              <div class="pcard__media"><img src="assets/siberrisk.jpg" alt="Siber Risk" /></div>
              <div class="pcard__foot">
                <span>Siber Risk</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
            <article class="pcard">
              <div class="pcard__media"><img src="assets/elektronikcihaz.jpg" alt="Elektronik Cihaz" /></div>
              <div class="pcard__foot">
                <span>Elektronik Cihaz</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
          </div>

          <div class="product__carousel-foot">
            <div class="dots" id="dots">
              <span class="dot is-active"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <span class="product__year">2025</span>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}
