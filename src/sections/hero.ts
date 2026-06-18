import { CLOCK_CITIES, clockSvgMarkup } from "@/sections/worldClocks";

/** HERO — video arka plan, navigasyon ve başlık. */
export function renderHero(): string {
  const istanbul = CLOCK_CITIES[0];
  return /* html */ `
  <header class="hero">
    <video class="hero__bg" loop muted playsinline preload="none" poster="assets/hero-poster.webp" data-src="https://fusionmarkt.s3.eu-central-1.amazonaws.com/sarjistasyonumguvende/0612.mp4"></video>
    <div class="hero__overlay"></div>

    <div class="hero-hud" id="heroHud">
      <button type="button" class="hero-hud__toggle" id="heroHudToggle" aria-pressed="true" aria-label="Paneli gizle">
        <svg class="hero-hud__eye" viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
      </button>

      <div class="rate-select rate-select--hud" id="rateSelect" hidden>
        <button type="button" class="rate-select__btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Döviz ve altın kuru — değiştirmek için tıklayın">
          <span class="rate-select__bg" aria-hidden="true"></span>
          <span class="rate-select__code">—</span>
          <span class="rate-select__value">0,00</span>
        </button>
        <ul class="rate-select__menu" role="listbox" hidden></ul>
      </div>

      <button type="button" class="hero-clock" id="heroClock" aria-label="${istanbul.city} saati — şehir değiştirmek için tıklayın">
        <span class="hero-clock__face">${clockSvgMarkup(istanbul, 99, true)}</span>
      </button>
    </div>

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
