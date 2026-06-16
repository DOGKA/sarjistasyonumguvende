import "./styles/main.css";

import { renderCompareNav, renderComparePage } from "@/sections/comparePage";
import { renderFooter } from "@/sections/footer";
import { initCompare } from "@/features/compare";

import { qs } from "@/lib/dom";

/** Araç karşılaştırma sayfasını oluştur ve etkileşimleri başlat. */
function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");

  app.innerHTML = [renderCompareNav(), renderComparePage(), renderFooter()].join("\n");

  initCompare();
}

bootstrap();
