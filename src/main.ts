import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderHero } from "@/sections/hero";
import { renderAbout } from "@/sections/about";
import { renderStations } from "@/sections/stations";
import { renderSolutions } from "@/sections/solutions";
import { renderCalcTeaser } from "@/sections/calcTeaser";
import { renderCompareTeaser } from "@/sections/compareTeaser";
import { renderProduct } from "@/sections/product";
import { renderReviews } from "@/sections/reviews";
import { renderRisk, renderQuizOverlay } from "@/sections/risk";
import { renderMission } from "@/sections/mission";
import { renderBlog } from "@/sections/blog";
import { renderCta } from "@/sections/cta";
import { renderFooter } from "@/sections/footer";

import { initHeroVideo } from "@/features/heroVideo";
import { initProductCarousel } from "@/features/productCarousel";
import { initReviewsCarousel } from "@/features/reviewsCarousel";
import { initRiskQuiz } from "@/features/riskQuiz";
import { initOcmMap } from "@/features/map/ocmMap";
import { initHeroClock } from "@/features/heroClock";
import { initHeroHud } from "@/features/heroHud";
import { initRates } from "@/features/rates";
import { initSiteHeader } from "@/features/siteHeader";
import { initSiteMedia } from "@/features/siteMedia";
import { initBlog } from "@/features/blog";

import { qs } from "@/lib/dom";

/** Sayfayı oluştur ve etkileşimleri başlat. */
function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");

  app.innerHTML = [
    renderSiteHeader({ variant: "overlay", active: "hakkimizda" }),
    renderHero(),
    renderAbout(),
    renderProduct(),
    renderSolutions(),
    renderCalcTeaser(),
    renderStations(),
    renderCompareTeaser(),
    renderReviews(),
    renderRisk(),
    renderMission(),
    renderBlog(),
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
  initHeroClock();
  initHeroHud();
  initSiteHeader();
  void initRates();
  void initSiteMedia();
  void initBlog();
}

bootstrap();
