/**
 * İletişim sayfası — talep formu (ad soyad, iletişim, mesaj) ve
 * en fazla 2 MB belge eki. Doğrulama/gönderim: features/contact.ts
 */
export function renderContactPage(): string {
  return /* html */ `
  <main class="contact">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">İletişim</span>
        <a href="/hesaplayici.html" class="link-arrow">Maliyet Hesaplayıcı</a>
      </div>

      <div class="contact__grid">
        <aside class="contact__intro">
          <h1>Bize Ulaşın</h1>
          <p>Teklif talebi, hasar bildirimi veya danışmanlık için formu doldurun. Dilerseniz poliçe, fatura ya da teknik belgenizi de ekleyebilirsiniz. Ekibimiz en kısa sürede size dönüş yapacaktır.</p>

          <ul class="contact__info">
            <li>
              <span class="contact__info-label">E-posta</span>
              <a href="mailto:info@sarjistasyonumguvende.com">info@sarjistasyonumguvende.com</a>
            </li>
            <li>
              <span class="contact__info-label">Telefon</span>
              <a href="tel:+902120000000">+90 212 000 00 00</a>
            </li>
            <li>
              <span class="contact__info-label">Çalışma Saatleri</span>
              <span>Hafta içi 09:00 – 18:00</span>
            </li>
          </ul>
        </aside>

        <form class="contact-form" id="contactForm" novalidate>
          <div class="contact-form__row">
            <div class="contact-form__field">
              <label for="cfName">Ad Soyad <span aria-hidden="true">*</span></label>
              <input type="text" id="cfName" name="name" autocomplete="name" placeholder="Adınız ve soyadınız" required />
            </div>
            <div class="contact-form__field">
              <label for="cfPhone">Telefon</label>
              <input type="tel" id="cfPhone" name="phone" autocomplete="tel" placeholder="(5xx) xxx xx xx" />
            </div>
          </div>

          <div class="contact-form__row">
            <div class="contact-form__field">
              <label for="cfEmail">E-posta <span aria-hidden="true">*</span></label>
              <input type="email" id="cfEmail" name="email" autocomplete="email" placeholder="ornek@firma.com" required />
            </div>
            <div class="contact-form__field">
              <label for="cfSubject">Talep Konusu</label>
              <div class="contact-form__select">
                <select id="cfSubject" name="subject">
                  <option value="Teklif Talebi">Teklif Talebi</option>
                  <option value="Hasar Bildirimi">Hasar Bildirimi</option>
                  <option value="Danışmanlık">Danışmanlık</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
            </div>
          </div>

          <div class="contact-form__field">
            <label for="cfMessage">Mesajınız <span aria-hidden="true">*</span></label>
            <textarea id="cfMessage" name="message" rows="5" placeholder="Talebinizi kısaca açıklayın…" required></textarea>
          </div>

          <div class="contact-form__field">
            <label for="cfFile">Belge Ekle</label>
            <label class="contact-form__file" id="cfFileDrop" for="cfFile">
              <input type="file" id="cfFile" name="document" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.heic" />
              <span class="contact-form__file-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4m0 0L8 8m4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
              </span>
              <span class="contact-form__file-text" id="cfFileText">Dosya seçin veya buraya sürükleyin</span>
              <span class="contact-form__file-hint">PDF, Word veya görsel · en fazla 2 MB</span>
            </label>
            <button type="button" class="contact-form__file-clear" id="cfFileClear" hidden>Eki kaldır</button>
          </div>

          <label class="contact-form__consent">
            <input type="checkbox" id="cfConsent" name="consent" required />
            <span>Kişisel verilerimin <a href="/gizlilik-politikasi.html">Gizlilik Politikası</a> kapsamında işlenmesini onaylıyorum.</span>
          </label>

          <div class="contact-form__foot">
            <button type="submit" class="btn btn--dark" id="cfSubmit">
              <span class="btn__dot btn__dot--ghost" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
              Talebi Gönder
            </button>
            <p class="contact-form__status" id="cfStatus" role="status" aria-live="polite"></p>
          </div>
        </form>
      </div>
    </div>
  </main>`;
}
