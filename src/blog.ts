import "./styles/main.css";

import { renderSiteHeader } from "@/sections/siteHeader";
import { renderBlogDetail } from "@/sections/blogDetail";
import { renderFooter } from "@/sections/footer";
import { initSiteHeader } from "@/features/siteHeader";
import { initBlogShare } from "@/features/blogShare";
import { initBlogDetailFilter } from "@/features/blog";
import { fetchPostBySlug, fetchPublishedPosts } from "@/features/blogData";
import { applyBlogSeo } from "@/features/blogSeo";
import { BLOG_POSTS } from "@/data/blog";
import type { BlogPost } from "@/types";

import { qs } from "@/lib/dom";

/** Blog detay sayfasını oluştur (slug varsa Supabase'ten, yoksa mockup). */
async function bootstrap(): Promise<void> {
  const app = qs<HTMLDivElement>("#app");

  const slug = new URLSearchParams(window.location.search).get("p");

  let detail: string;
  let others: BlogPost[] = BLOG_POSTS.slice(1);
  if (slug) {
    const post = await fetchPostBySlug(slug);
    if (post) {
      const all = (await fetchPublishedPosts(12)) ?? [];
      others = all.filter((p) => p.slug !== post.slug);
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
  initBlogDetailFilter(others);
}

void bootstrap();
