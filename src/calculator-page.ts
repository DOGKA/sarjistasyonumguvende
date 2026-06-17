import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderCalculator } from "@/sections/calculator";
import { renderFooter } from "@/sections/footer";
import { initCalculator } from "@/features/calculator";
import { initSiteHeader } from "@/features/siteHeader";

import { qs } from "@/lib/dom";

/** Şarj maliyeti hesaplayıcı sayfasını oluştur ve etkileşimleri başlat. */
function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");

  app.innerHTML = [
    renderSiteHeader({ variant: "solid" }),
    renderCalculator(),
    renderFooter(),
  ].join("\n");

  initCalculator();
  initSiteHeader();
}

bootstrap();
