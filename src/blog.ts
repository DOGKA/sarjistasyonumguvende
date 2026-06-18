import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderBlogDetail } from "@/sections/blogDetail";
import { renderFooter } from "@/sections/footer";
import { initSiteHeader } from "@/features/siteHeader";
import { initBlogShare } from "@/features/blogShare";
import { fetchPostBySlug, fetchPublishedPosts } from "@/features/blogData";
import { applyBlogSeo } from "@/features/blogSeo";

import { qs } from "@/lib/dom";

/** Blog detay sayfasını oluştur (slug varsa Supabase'ten, yoksa mockup). */
async function bootstrap(): Promise<void> {
  const app = qs<HTMLDivElement>("#app");

  const slug = new URLSearchParams(window.location.search).get("p");

  let detail: string;
  if (slug) {
    const post = await fetchPostBySlug(slug);
    if (post) {
      const all = (await fetchPublishedPosts(7)) ?? [];
      const others = all.filter((p) => p.slug !== post.slug).slice(0, 3);
      detail = renderBlogDetail(post, others);
      applyBlogSeo(post);
    } else {
      // Slug bulunamadı — ana sayfadaki blog bölümüne yönlendir.
      window.location.replace("/#blog");
      return;
    }
  } else {
    detail = renderBlogDetail();
  }

  app.innerHTML = [
    renderSiteHeader({ variant: "solid" }),
    detail,
    renderFooter(),
  ].join("\n");

  initSiteHeader();
  initBlogShare();
}

void bootstrap();
