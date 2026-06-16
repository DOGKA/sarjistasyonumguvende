/** 05 — REFERANSLAR. İşlevsellik: features/reviewsCarousel.ts */
export function renderReviews(): string {
  return /* html */ `
  <section class="reviews" id="referanslar">
    <div class="container">
      <div class="reviews__head">
        <span class="eyebrow">05 &nbsp;·&nbsp; Müşterilerimizden</span>
        <h2>Müşterilerimizin<br />Deneyimleri.</h2>
      </div>

      <div class="reviews__grid" id="reviewsGrid">
        <article class="rcard rcard--rate">
          <div class="rcard__top">
            <span class="rcard__tag">Türkiye Genelinde Tercih Edilir</span>
            <span class="dots dots--mini"><span class="dot is-active"></span><span class="dot"></span><span class="dot"></span></span>
          </div>
          <div class="rate">
            <span class="rate__num">4.9<small>/5</small></span>
            <p>Evden kuruluma, filo çözümlerinden hasar süreçlerine kadar müşterilerimizin neden bizi tercih ettiğini keşfedin.</p>
          </div>
          <div class="rcard__bottom">
            <div class="avatars">
              <img class="avatar" src="assets/av-9f2a.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-3b7c.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-c41d.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-7e08.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-1a55.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-b6f3.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-2d9e.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-84ca.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-0c73.jpg" alt="" loading="lazy" />
              <img class="avatar" src="assets/av-e92f.jpg" alt="" loading="lazy" />
              <span class="avatars__count">10B+</span>
            </div>
            <a href="#iletisim" class="link-arrow link-arrow--sm">Görüşünüzü Paylaşın</a>
          </div>
        </article>

        <article class="rcard rcard--review">
          <div class="rcard__top">
            <div class="reviewer">
              <img class="avatar avatar--lg" id="rvAvatar" src="assets/av-9f2a.jpg" alt="Müşteri" />
              <div>
                <strong id="rvName">Mehmet K.</strong>
                <small id="rvTitle">Şarj Ağı İşletmecisi</small>
              </div>
            </div>
            <span class="dots dots--mini" id="rvDots"></span>
          </div>
          <div class="stars" id="rvStars" aria-label="Puan">★★★★★</div>
          <p class="rcard__quote" id="rvQuote">“AVM otoparkındaki DC şarj ünitemizde yaşanan güç modülü arızasında süreç beklediğimizden hızlı ilerledi. Eksper yönlendirmesi ve hasar takibi konusunda düzenli bilgilendirme aldık.”</p>
          <button type="button" class="link-arrow link-arrow--sm" id="rvNext">Sonraki Görüş</button>
        </article>

        <article class="rcard rcard--mini" id="rvMini">
          <div class="rcard__top">
            <span class="dots dots--mini"><span class="dot"></span><span class="dot is-active"></span><span class="dot"></span></span>
          </div>
          <div class="reviewer reviewer--v">
            <strong id="rvMiniName">Ahmet T.</strong>
            <small id="rvMiniTitle">Filo Yönetimi Sorumlusu</small>
            <img class="avatar avatar--lg" id="rvMiniAvatar" src="assets/av-3b7c.jpg" alt="Müşteri" />
          </div>
        </article>
      </div>
    </div>
  </section>`;
}
