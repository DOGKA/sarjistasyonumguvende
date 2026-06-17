/** 05 — REFERANSLAR. İşlevsellik: features/reviewsCarousel.ts */
export function renderReviews(): string {
  return /* html */ `
  <section class="reviews" id="referanslar">
    <div class="container">
      <div class="reviews__head">
        <span class="eyebrow">06 &nbsp;·&nbsp; Müşterilerimizden</span>
        <h2>Müşterilerimizin<br />Deneyimleri.</h2>
      </div>

      <div class="reviews__grid" id="reviewsGrid">
        <article class="rcard rcard--rate">
          <div class="rcard__top">
            <span class="rcard__tag">Türkiye Genelinde Tercih Edilir</span>
            <span class="dots dots--mini"><span class="dot is-active"></span><span class="dot"></span><span class="dot"></span></span>
          </div>
          <div class="rate">
            <a href="#iletisim" class="rate__cta">Görüşünüzü Paylaşın</a>
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
              <span class="avatars__count">10B+</span>
            </div>
          </div>
        </article>

        <div class="reviews__viewport">
          <div class="reviews__track" id="reviewsTrack"></div>
          <span class="reviews__fade reviews__fade--l" aria-hidden="true"></span>
          <span class="reviews__fade reviews__fade--r" aria-hidden="true"></span>
        </div>
      </div>

      <button type="button" class="link-arrow link-arrow--sm reviews__next" id="rvNext">Sonraki Görüşler</button>
    </div>
  </section>`;
}
