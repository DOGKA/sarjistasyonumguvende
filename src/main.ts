import "./styles/main.css";

import { renderHero } from "@/sections/hero";
import { renderAbout } from "@/sections/about";
import { renderStations } from "@/sections/stations";
import { renderSolutions } from "@/sections/solutions";
import { renderCalculator } from "@/sections/calculator";
import { renderCompareTeaser } from "@/sections/compareTeaser";
import { renderProduct } from "@/sections/product";
import { renderReviews } from "@/sections/reviews";
import { renderRisk, renderQuizOverlay } from "@/sections/risk";
import { renderMission } from "@/sections/mission";
import { renderCta } from "@/sections/cta";
import { renderFooter } from "@/sections/footer";

import { initHeroVideo } from "@/features/heroVideo";
import { initProductCarousel } from "@/features/productCarousel";
import { initReviewsCarousel } from "@/features/reviewsCarousel";
import { initRiskQuiz } from "@/features/riskQuiz";
import { initOcmMap } from "@/features/map/ocmMap";
import { initCalculator } from "@/features/calculator";

import { qs } from "@/lib/dom";

/** Sayfayı oluştur ve etkileşimleri başlat. */
function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");

  app.innerHTML = [
    renderHero(),
    renderAbout(),
    renderStations(),
    renderSolutions(),
    renderCalculator(),
    renderCompareTeaser(),
    renderProduct(),
    renderReviews(),
    renderRisk(),
    renderMission(),
    renderCta(),
    renderFooter(),
  ].join("\n");

  // Tam ekran risk testi overlay'i body sonuna eklenir
  document.body.insertAdjacentHTML("beforeend", renderQuizOverlay());

  initHeroVideo();
  initProductCarousel();
  initReviewsCarousel();
  initRiskQuiz();
  initOcmMap();
  initCalculator();
}

bootstrap();
