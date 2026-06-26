/** 04 — TEMİNATLAR (koyu). İşlevsellik: features/productCarousel.ts */
export function renderProduct(): string {
  return /* html */ `
  <section class="product" id="teminatlar">
    <div class="container">
      <div class="product__top">
        <div class="product__intro">
          <div class="product__intro-frame" id="introFrame"><img data-media="product_intro" src="assets/kapsamlikoruma.jpg" alt="Kapsamlı Koruma" width="360" height="260" loading="lazy" /></div>
          <span class="product__intro-label">Kapsamlı Koruma</span>
        </div>
        <div class="product__title">
          <h2>Şarj İstasyonunuzun Karşılaşabileceği<br />Tüm Risklere Karşı Koruma</h2>
          <span class="eyebrow eyebrow--light">02 &nbsp;·&nbsp; Teminatlar</span>
        </div>
      </div>

      <div class="product__body">
        <div class="product__menu" id="pmenu">
          <button class="pmenu is-active" data-index="0">Yangın ve Patlama Hasarları <span class="pmenu__arrow">→</span></button>
          <button class="pmenu" data-index="1">Araç Çarpması ve Vandalizm <span class="pmenu__arrow">→</span></button>
          <button class="pmenu" data-index="2">Sel, Fırtına ve Doğal Afetler <span class="pmenu__arrow">→</span></button>
          <button class="pmenu" data-index="3">Siber Saldırılar ve Yazılım Riskleri <span class="pmenu__arrow">→</span></button>
          <button class="pmenu" data-index="4">Elektronik Devre ve Güç Hasarları <span class="pmenu__arrow">→</span></button>
        </div>

        <div class="product__carousel">
          <div class="pcards" id="pcards">
            <article class="pcard">
              <div class="pcard__media"><img data-media="product_fire" src="assets/yanginteminati.jpg" alt="Yangın ve Patlama Hasarları" width="520" height="360" loading="lazy" /></div>
              <div class="pcard__foot">
                <span>Yangın ve Patlama Hasarları</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
            <article class="pcard">
              <div class="pcard__media"><img data-media="product_machine" src="assets/makinakirilmasi.jpg" alt="Araç Çarpması ve Vandalizm" width="520" height="360" loading="lazy" /></div>
              <div class="pcard__foot">
                <span>Araç Çarpması ve Vandalizm</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
            <article class="pcard">
              <div class="pcard__media"><img data-media="product_disaster" src="assets/dogalafet.jpg" alt="Sel, Fırtına ve Doğal Afetler" width="520" height="360" loading="lazy" /></div>
              <div class="pcard__foot">
                <span>Sel, Fırtına ve Doğal Afetler</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
            <article class="pcard">
              <div class="pcard__media"><img data-media="product_cyber" src="assets/siberrisk.jpg" alt="Siber Saldırılar ve Yazılım Riskleri" width="520" height="360" loading="lazy" /></div>
              <div class="pcard__foot">
                <span>Siber Saldırılar ve Yazılım Riskleri</span>
                <a href="#iletisim">Teminat Detayı →</a>
              </div>
            </article>
            <article class="pcard">
              <div class="pcard__media"><img data-media="product_electronic" src="assets/elektronikcihaz.jpg" alt="Elektronik Devre ve Güç Hasarları" width="520" height="360" loading="lazy" /></div>
              <div class="pcard__foot">
                <span>Elektronik Devre ve Güç Hasarları</span>
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

      <div class="product__details">
        ${[
          {
            title: "Araç Çarpması ve Fiziksel Hasarlar",
            desc: "Şarj ünitesine araç çarpması, vandalizm ve dış etkenlerden kaynaklanan fiziksel hasarlar için koruma.",
            tag: "Kritik",
          },
          {
            title: "Kablo Hırsızlığı",
            desc: "Şarj kabloları ve bağlantı ekipmanlarının çalınması veya zarar görmesi sonucu oluşabilecek mali kayıplara karşı koruma.",
          },
          {
            title: "Üçüncü Şahıs Mali Sorumluluk",
            desc: "İstasyonun kullanımından kaynaklanan üçüncü şahıs bedeni veya maddi zarar taleplerine karşı güvence.",
          },
          {
            title: "Gelir Kaybı",
            desc: "Hasar sonrası hizmet verilememesi nedeniyle oluşabilecek gelir kayıplarına yönelik ek teminat seçenekleri.",
          },
        ]
          .map(
            (c) => /* html */ `
        <article class="tcard">
          ${c.tag ? /* html */ `<span class="tcard__tag">${c.tag}</span>` : ""}
          <h3 class="tcard__title">${c.title}</h3>
          <p class="tcard__desc">${c.desc}</p>
        </article>`,
          )
          .join("")}
      </div>

      <div class="product__why">
        <h3 class="product__why-title">Neden Şarj İstasyonları Sigortalanmalı?</h3>
        <ul class="product__why-list">
          ${[
            "Elektronik ekipman maliyetleri yüksektir",
            "Araç çarpması riski yüksektir",
            "Kablo ve ekipman hırsızlıkları yaşanabilmektedir",
            "Elektriksel arızalar hizmet kesintisine neden olabilir",
            "Tek bir hasar on binlerce hatta yüz binlerce liralık kayıp oluşturabilir",
          ]
            .map(
              (item) => /* html */ `
          <li class="product__why-item">
            <span class="product__why-check" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4.5 4.5L19 7"/></svg>
            </span>
            ${item}
          </li>`,
            )
            .join("")}
        </ul>
      </div>
    </div>
  </section>`;
}
