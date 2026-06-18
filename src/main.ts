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
import { initHeroClock } from "@/features/heroClock";
import { initHeroHud } from "@/features/heroHud";
import { initRates } from "@/features/rates";
import { initSiteHeader } from "@/features/siteHeader";
import { initSiteMedia } from "@/features/siteMedia";
import { initBlog } from "@/features/blog";

import { qs, qsOpt } from "@/lib/dom";

/**
 * Şarj istasyonu haritasını (Leaflet + ocmMap chunk'ı, ~170 KB) yalnızca
 * harita bölümü görünüme yaklaştığında tembel yükler. Böylece ilk yükte
 * harita kodu taşınmaz.
 */
function initOcmMapLazy(): void {
  const mapEl = qsOpt<HTMLElement>("#ocmMap");
  if (!mapEl) return;

  const load = (): void => {
    void import("@/features/map/ocmMap").then((m) => m.initOcmMap());
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(mapEl);
  } else {
    load();
  }
}

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
  initOcmMapLazy();
  initHeroClock();
  initHeroHud();
  initSiteHeader();

  // Kritik olmayan işler (kur verisi, admin görsel override'ları, blog verisi)
  // boştayken çalışır; Supabase chunk'ı bu sırada yüklenir, LCP ile yarışmaz.
  whenIdle(() => {
    void initRates();
    void initSiteMedia();
    void initBlog();
  });
}

/** Tarayıcı boştayken (yoksa kısa gecikmeyle) bir işi çalıştırır. */
function whenIdle(cb: () => void): void {
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (typeof ric === "function") ric(cb, { timeout: 2000 });
  else window.setTimeout(cb, 1);
}

bootstrap();
