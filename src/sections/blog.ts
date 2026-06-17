import { esc } from "@/lib/dom";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/data/blog";
import type { BlogPost } from "@/types";

/** Yayın tarihi · okuma süresi meta satırı. */
function meta(post: BlogPost): string {
  return `${esc(post.date)} &nbsp;·&nbsp; ${post.readMin} dk okuma`;
}

/** Öne çıkan "Today's Article" kartı (büyük, kapak mockup + okuma butonu). */
function renderFeatured(post: BlogPost): string {
  return /* html */ `
  <article class="blog-feature">
    <a class="blog-feature__media mockup" href="blog.html" data-dim="${esc(post.dim)}" aria-label="${esc(post.title)} kapak görseli">
      <span class="blog-bookmark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>
      </span>
    </a>
    <div class="blog-feature__body">
      <span class="blog-tag">${esc(post.category)}</span>
      <p class="blog-meta">${meta(post)}</p>
      <h3 class="blog-feature__title">${esc(post.title)}</h3>
      <p class="blog-feature__excerpt">${esc(post.excerpt)}</p>
      <a href="blog.html" class="blog-readmore">Read More</a>
    </div>
  </article>`;
}

/** Izgaradaki standart blog kartı (kapak mockup + özet). Detay sayfasında da kullanılır. */
export function renderBlogCard(post: BlogPost): string {
  return /* html */ `
  <article class="blog-card">
    <a class="blog-card__media mockup" href="blog.html" data-dim="${esc(post.dim)}" aria-label="${esc(post.title)} kapak görseli">
      <span class="blog-card__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg>
      </span>
    </a>
    <div class="blog-card__body">
      <div class="blog-card__top">
        <span class="blog-tag">${esc(post.category)}</span>
      </div>
      <h4 class="blog-card__title">${esc(post.title)}</h4>
      <p class="blog-card__excerpt">${esc(post.excerpt)}</p>
      <p class="blog-meta">${meta(post)}</p>
    </div>
  </article>`;
}

/** "More Articles" mobil liste satırı (küçük thumbnail + beğeni rozeti). */
function renderListItem(post: BlogPost): string {
  return /* html */ `
  <a class="blog-li" href="blog.html">
    <span class="blog-li__thumb mockup" data-dim="${esc(post.dim)}" aria-hidden="true"></span>
    <span class="blog-li__info">
      <span class="blog-li__title">${esc(post.title)}</span>
      <span class="blog-meta">${meta(post)}</span>
    </span>
  </a>`;
}

/** 08 — BLOG. Statik mockup içerik (lorem ipsum), görsel yerine ölçü etiketli placeholder. */
export function renderBlog(): string {
  const [featured, ...rest] = BLOG_POSTS;
  const tabs = BLOG_CATEGORIES.map(
    (c, i) => `<button type="button" class="blog-tab${i === 0 ? " is-active" : ""}">${esc(c)}</button>`
  ).join("");

  return /* html */ `
  <section class="blog" id="blog">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">08 &nbsp;·&nbsp; Blog</span>
        <a href="#blog" class="link-arrow">Tümünü Gör</a>
      </div>

      <div class="blog__head">
        <h2>Blog &amp; Haberler</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sektörden güncel yazılar, rehberler ve ipuçları.</p>
      </div>

      <div class="blog__toolbar">
        <div class="blog__tabs" role="tablist" aria-label="Blog kategorileri">${tabs}</div>
        <form class="blog__search" role="search" onsubmit="return false">
          <svg class="blog__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" placeholder="Konu ara..." aria-label="Blogda ara" />
        </form>
      </div>

      <div class="blog__layout">
        <div class="blog__primary">
          <p class="blog__kicker">Today's Article</p>
          ${renderFeatured(featured)}
        </div>

        <aside class="blog__aside">
          <div class="blog__aside-head">
            <h3>More Articles</h3>
            <a href="#blog" class="link-arrow link-arrow--sm">See All</a>
          </div>
          <div class="blog__list">
            ${rest.map(renderListItem).join("\n")}
          </div>
        </aside>
      </div>
    </div>
  </section>`;
}
