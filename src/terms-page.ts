import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderLegalPage } from "@/sections/legalPage";
import { renderFooter } from "@/sections/footer";
import { initSiteHeader } from "@/features/siteHeader";

import { COMPANY } from "@/config";
import { qs } from "@/lib/dom";

const BODY = /* html */ `
  <h2>1. Genel</h2>
  <p>
    Bu Kullanım Koşulları, ${COMPANY.brand} ("Şirket", "biz") tarafından işletilen
    web sitesinin ("Site") kullanımına ilişkin kuralları düzenler. Siteyi ziyaret
    ederek veya kullanarak bu koşulları kabul etmiş sayılırsınız. Koşulları kabul
    etmiyorsanız lütfen Siteyi kullanmayınız.
  </p>

  <h2>2. Hizmetin Kapsamı</h2>
  <p>
    Site; elektrikli araç şarj istasyonlarına yönelik sigorta ve danışmanlık
    hizmetleri hakkında bilgilendirme yapmak, teklif ve iletişim talebi almak
    amacıyla sunulmaktadır. Sitede yer alan bilgiler genel bilgilendirme niteliğinde
    olup bağlayıcı bir teklif veya sözleşme teşkil etmez.
  </p>

  <h2>3. Kullanıcının Yükümlülükleri</h2>
  <ul>
    <li>Siteyi yalnızca yasalara uygun ve meşru amaçlarla kullanmayı,</li>
    <li>Form ve iletişim kanallarında doğru, güncel ve eksiksiz bilgi vermeyi,</li>
    <li>Sitenin güvenliğini veya işleyişini bozacak girişimlerde bulunmamayı</li>
  </ul>
  <p>kabul ve taahhüt edersiniz.</p>

  <h2>4. Fikri Mülkiyet Hakları</h2>
  <p>
    Sitede yer alan logo, marka, metin, görsel ve tasarımlar dâhil tüm içerik
    Şirkete veya ilgili hak sahiplerine aittir. Önceden yazılı izin alınmaksızın
    kopyalanamaz, çoğaltılamaz veya dağıtılamaz.
  </p>

  <h2>5. Sorumluluğun Sınırlandırılması</h2>
  <p>
    Site içeriğinin doğruluğu için makul özen gösterilmekle birlikte, içeriğin
    kesintisiz veya hatasız olacağı garanti edilmez. Sitenin kullanımından doğabilecek
    doğrudan veya dolaylı zararlardan Şirket sorumlu tutulamaz.
  </p>

  <h2>6. Üçüncü Taraf Bağlantıları</h2>
  <p>
    Site, üçüncü taraflara ait web sitelerine bağlantılar içerebilir. Bu sitelerin
    içeriğinden veya gizlilik uygulamalarından Şirket sorumlu değildir.
  </p>

  <h2>7. Değişiklikler</h2>
  <p>
    Şirket, bu Kullanım Koşullarını dilediği zaman güncelleyebilir. Güncel sürüm bu
    sayfada yayımlandığı anda yürürlüğe girer.
  </p>

  <h2>8. İletişim</h2>
  <p>
    Sorularınız için bizimle <a href="/iletisim.html">iletişim sayfası</a> üzerinden
    veya <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> adresinden iletişime
    geçebilirsiniz.
  </p>
`;

function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");

  app.innerHTML = [
    renderSiteHeader({ variant: "solid" }),
    renderLegalPage({
      title: "Kullanım Koşulları",
      intro:
        "Web sitemizi kullanmadan önce lütfen aşağıdaki koşulları dikkatlice okuyunuz.",
      body: BODY,
    }),
    renderFooter(),
  ].join("\n");

  initSiteHeader();
}

bootstrap();
