import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderBlogDetail } from "@/sections/blogDetail";
import { renderFooter } from "@/sections/footer";
import { initSiteHeader } from "@/features/siteHeader";
import { initBlogShare } from "@/features/blogShare";

import { qs } from "@/lib/dom";

/** Blog detay sayfasını oluştur. */
function bootstrap(): void {
  const app = qs<HTMLDivElement>("#app");
  app.innerHTML = [
    renderSiteHeader({ variant: "solid" }),
    renderBlogDetail(),
    renderFooter(),
  ].join("\n");

  initSiteHeader();
  initBlogShare();
}

bootstrap();
