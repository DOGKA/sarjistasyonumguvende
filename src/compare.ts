import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderComparePage } from "@/sections/comparePage";
import { renderFooter } from "@/sections/footer";
import { initCompare } from "@/features/compare";
import { initSiteHeader } from "@/features/siteHeader";

import { qs } from "@/lib/dom";

/** Araç karşılaştırma sayfasını oluştur ve etkileşimleri başlat. */
function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");

  app.innerHTML = [
    renderSiteHeader({ variant: "solid" }),
    renderComparePage(),
    renderFooter(),
  ].join("\n");

  initCompare();
  initSiteHeader();
}

bootstrap();
