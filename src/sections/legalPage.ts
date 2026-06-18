interface LegalPageOptions {
  /** Sayfa başlığı (örn. "Kullanım Koşulları"). */
  title: string;
  /** Başlık altı kısa açıklama. */
  intro?: string;
  /** Son güncelleme tarihi metni (örn. "18 Haziran 2026"). */
  updated?: string;
  /** Sayfa gövdesi — hazır HTML (başlık + paragraflar). */
  body: string;
}

/**
 * Basit yasal metin sayfası iskeleti (Kullanım Koşulları, Gizlilik Politikası).
 * Üst başlık ve footer ayrı render edilir; bu yalnızca içerik bloğudur.
 */
export function renderLegalPage(opts: LegalPageOptions): string {
  const { title, intro, updated, body } = opts;

  return /* html */ `
  <main class="legal">
    <div class="container">
      <header class="legal__head">
        <span class="eyebrow">Yasal</span>
        <h1 class="legal__title">${title}</h1>
        ${intro ? `<p class="legal__intro">${intro}</p>` : ""}
        ${updated ? `<p class="legal__updated">Son güncelleme: ${updated}</p>` : ""}
      </header>

      <article class="legal__body">
        ${body}
      </article>
    </div>
  </main>`;
}
