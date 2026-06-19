/** RİSK TESTİ — başlatıcı bölüm + tam ekran overlay. İşlevsellik: features/riskQuiz.ts */
export function renderRisk(): string {
  return /* html */ `
  <section class="risk" id="risk-testi">
    <canvas class="risk__bg" id="riskLauncherBg" aria-hidden="true"></canvas>
    <div class="risk__overlay-grad" aria-hidden="true"></div>
    <div class="container risk__inner">
      <span class="eyebrow eyebrow--light risk__eyebrow">Risk Testi &nbsp;·&nbsp; 2 Dakika</span>
      <div class="risk__card">
        <span class="risk__tab risk__tab--tl">✦ risk</span>
        <h2 class="risk__headline">şarj<br />istasyonunuz<br />güvende mi?</h2>
        <p class="risk__lead">20 soruda istasyonunuzun risk profilini ölçün, kişiselleştirilmiş skorunuzu öğrenin.</p>
        <button type="button" class="risk__start" id="riskStart">Teste Başla</button>
        <span class="risk__tab risk__tab--br">⚡ skor</span>
      </div>
    </div>
  </section>`;
}

/** Tam ekran test overlay'i (body sonuna eklenir, JS doldurur). */
export function renderQuizOverlay(): string {
  return /* html */ `
  <div class="quiz" id="quizOverlay" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Şarj İstasyonu Risk Testi">
    <canvas class="quiz__bg" id="quizBg" aria-hidden="true"></canvas>
    <div class="quiz__topbar">
      <a class="quiz__brand" href="/" aria-label="Doğa Danışmanlık — ana sayfa">
        <img src="/assets/logos/dogalogo-white.svg" alt="Doğa Danışmanlık" />
      </a>
      <button type="button" class="quiz__close" id="quizClose" aria-label="Kapat">×</button>
    </div>
    <div class="quiz__stage" id="quizStage"></div>
  </div>`;
}
