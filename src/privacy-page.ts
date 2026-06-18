import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderLegalPage } from "@/sections/legalPage";
import { renderFooter } from "@/sections/footer";
import { initSiteHeader } from "@/features/siteHeader";

import { COMPANY } from "@/config";
import { qs } from "@/lib/dom";

const BODY = /* html */ `
  <h2>1. Veri Sorumlusu</h2>
  <p>
    Kişisel verileriniz, veri sorumlusu sıfatıyla ${COMPANY.brand} tarafından, 6698
    sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında işlenmektedir.
  </p>

  <h2>2. İşlenen Veriler</h2>
  <p>Site üzerinden aşağıdaki kişisel verileriniz işlenebilir:</p>
  <ul>
    <li><strong>Kimlik ve iletişim bilgileri:</strong> ad soyad, e-posta, telefon,</li>
    <li><strong>Talep bilgileri:</strong> form ve mesaj içerikleri, eklenen belgeler,</li>
    <li><strong>Teknik veriler:</strong> çerezler aracılığıyla toplanan kullanım verileri.</li>
  </ul>

  <h2>3. İşleme Amaçları</h2>
  <ul>
    <li>Teklif, danışmanlık ve iletişim taleplerinizin karşılanması,</li>
    <li>Hizmetlerimizin sunulması ve geliştirilmesi,</li>
    <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
  </ul>

  <h2>4. Hukuki Sebep</h2>
  <p>
    Verileriniz; açık rızanız, bir sözleşmenin kurulması ya da ifası ve Şirketin
    meşru menfaatleri hukuki sebeplerine dayanılarak işlenir.
  </p>

  <h2>5. Verilerin Aktarımı</h2>
  <p>
    Kişisel verileriniz, yalnızca yukarıdaki amaçlarla sınırlı olmak üzere; yetkili
    kamu kurumlarına ve hizmet aldığımız tedarikçilere (ör. barındırma ve analiz
    sağlayıcıları) mevzuata uygun şekilde aktarılabilir.
  </p>

  <h2>6. Çerezler</h2>
  <p>
    Sitemiz, deneyiminizi iyileştirmek ve trafiği analiz etmek amacıyla çerezler
    kullanır. Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz. Çerez
    politikamızla ilgili ayrıntılı bilgi yakında bu bölümde yayımlanacaktır.
  </p>

  <h2>7. Haklarınız</h2>
  <p>KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme ve işlemeye itiraz etme haklarına sahipsiniz.</p>

  <h2>8. İletişim</h2>
  <p>
    Haklarınızı kullanmak veya sorularınız için
    <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> adresinden ya da
    <a href="/iletisim.html">iletişim sayfamız</a> üzerinden bize ulaşabilirsiniz.
  </p>
`;

function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");

  app.innerHTML = [
    renderSiteHeader({ variant: "solid" }),
    renderLegalPage({
      title: "Gizlilik Politikası",
      intro:
        "Kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklarız.",
      body: BODY,
    }),
    renderFooter(),
  ].join("\n");

  initSiteHeader();
}

bootstrap();
