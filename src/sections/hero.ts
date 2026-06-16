/** HERO — video arka plan, navigasyon ve başlık. */
export function renderHero(): string {
  return /* html */ `
  <header class="hero">
    <video class="hero__bg" autoplay loop muted playsinline preload="auto" poster="">
      <source src="https://fusionmarkt.s3.eu-central-1.amazonaws.com/sarjistasyonumguvende/0612.mp4" type="video/mp4" />
    </video>
    <div class="hero__overlay"></div>

    <nav class="nav">
      <a href="#" class="nav__logo">Şarj İstasyonum Güvende</a>
      <ul class="nav__menu">
        <li><a href="#hakkimizda" class="is-active">Hakkımızda <span class="nav__arrow" aria-hidden="true">→</span></a></li>
        <li><a href="#harita">Harita</a></li>
        <li><a href="#cozumler">Çözümler</a></li>
        <li><a href="#teminatlar">Teminatlar</a></li>
        <li><a href="#referanslar">Referanslar</a></li>
        <li><a href="#risk-testi">Risk Testi</a></li>
      </ul>
      <a href="#iletisim" class="nav__cta">Teklif Al</a>
    </nav>

    <div class="hero__top">
      <p class="hero__lead">Elektrikli araç şarj istasyonlarınız için güvenilir, kapsamlı ve uzman sigorta çözümleri; ev, işyeri ve kamusal alanlar için.</p>
    </div>

    <div class="hero__headline">
      <h1>SİGORTA</h1>
      <div class="hero__tags">
        <span>[ Çevre Dostu ]</span>
        <span>[ ©2025 ]</span>
      </div>
    </div>
  </header>`;
}
