import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderContactPage } from "@/sections/contactPage";
import { renderFooter } from "@/sections/footer";
import { initContact } from "@/features/contact";
import { initSiteHeader } from "@/features/siteHeader";

import { qs } from "@/lib/dom";

/** İletişim sayfasını oluştur ve form etkileşimlerini başlat. */
function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");

  app.innerHTML = [
    renderSiteHeader({ variant: "solid", active: "iletisim" }),
    renderContactPage(),
    renderFooter(),
  ].join("\n");

  initContact();
  initSiteHeader();
}

bootstrap();
