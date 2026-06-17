/** 06 — MİSYON / RAKAMLAR. */
export function renderMission(): string {
  return /* html */ `
  <section class="mission">
    <div class="container">
      <span class="mission__brand">Şarj İstasyonum Güvende</span>
      <div class="mission__head">
        <h2>Şarj İstasyonu Sigortacılığında<br />Rakamlarla Biz</h2>
        <span class="eyebrow">07 &nbsp;·&nbsp; Misyonumuz</span>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="stat__num">10B+</span>
          <p>Güvence altına alınan şarj ünitesi</p>
        </div>
        <div class="stat">
          <span class="stat__num">30+</span>
          <p>Şarj istasyonuna özel teminat çözümü</p>
        </div>
        <div class="stat">
          <span class="stat__num">%98</span>
          <p>Hasar süreçlerinde müşteri memnuniyeti</p>
        </div>
        <div class="stat">
          <span class="stat__num">7/24</span>
          <p>Kesintisiz hasar ve danışmanlık desteği</p>
        </div>
      </div>

      <div class="mission__boxes">
        <div class="mbox mbox--icon">
          <span class="mbox__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="16" height="11" rx="2"/><path d="M19 10h2v5h-2"/><path d="M7 4h4"/><path d="m10 10-2 3h3l-2 3"/></svg>
          </span>
          <div class="mbox__foot">
            <span class="stat__num">10B+</span>
            <p>Güvence altına alınan şarj ünitesi</p>
          </div>
        </div>
        <div class="mbox mbox--icon">
          <span class="mbox__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="3" width="9" height="18" rx="2"/><path d="M10 7h1"/><path d="m11 11-2 3h3l-2 3"/><path d="M15 9h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 1-3 0v-3"/></svg>
          </span>
          <div class="mbox__foot">
            <span class="stat__num">30+</span>
            <p>Anlaşmalı sigorta ve teminat çözümü</p>
          </div>
        </div>
        <div class="mbox mbox--eco">
          <img class="mbox__bg" src="assets/onleyici-tasarim.png" alt="" aria-hidden="true" />
          <div class="mbox__eco-head">
            <span class="mbox__icon mbox__icon--leaf" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 20A7 7 0 0 1 4 13C4 8 8 4 18 4c0 10-4 14-9 14Z"/><path d="M8 17c2-4 5-6 9-7"/></svg>
            </span>
            <h3>Önleyici Yaklaşım</h3>
          </div>
          <p>Periyodik bakım, uzaktan izleme ve risk mühendisliği ile hasar oluşmadan önlemeye odaklanan sürdürülebilir koruma.</p>
        </div>
      </div>
    </div>
  </section>`;
}
