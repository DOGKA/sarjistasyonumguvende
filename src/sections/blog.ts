import { esc } from "@/lib/dom";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/data/blog";
import type { BlogPost } from "@/types";

/** Yayın tarihi · okuma süresi meta satırı. */
function meta(post: BlogPost): string {
  return `${esc(post.date)} &nbsp;·&nbsp; ${post.readMin} dk okuma`;
}

/** Yazının detay sayfası bağlantısı (slug varsa dinamik, yoksa statik). */
function href(post: BlogPost): string {
  return post.slug ? `blog.html?p=${encodeURIComponent(post.slug)}` : "blog.html";
}

/** Kapak medyası: gerçek görsel varsa <img>, yoksa yalnızca iç içerik (mockup). */
function media(post: BlogPost, inner: string): string {
  if (post.coverUrl) {
    return `<img src="${esc(post.coverUrl)}" alt="${esc(
      post.coverAlt || post.title
    )}" loading="lazy" />${inner}`;
  }
  return inner;
}

function mediaClass(post: BlogPost, base: string): string {
  return post.coverUrl ? base : `${base} mockup`;
}

function dimAttr(post: BlogPost): string {
  return post.coverUrl ? "" : ` data-dim="${esc(post.dim ?? "")}"`;
}

/** Öne çıkan "Today's Article" kartı (büyük, kapak + okuma butonu). */
function renderFeatured(post: BlogPost): string {
  const bookmark = `
      <span class="blog-bookmark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>
      </span>`;
  return /* html */ `
  <article class="blog-feature">
    <a class="${mediaClass(post, "blog-feature__media")}" href="${href(
    post
    )}"${dimAttr(post)} aria-label="${esc(post.title)} kapak görseli">
      ${media(post, bookmark)}
    </a>
    <div class="blog-feature__body">
      <span class="blog-tag">${esc(post.category)}</span>
      <p class="blog-meta">${meta(post)}</p>
      <h3 class="blog-feature__title">${esc(post.title)}</h3>
      <p class="blog-feature__excerpt">${esc(post.excerpt)}</p>
      <a href="${href(post)}" class="blog-readmore">Devamını Oku</a>
    </div>
  </article>`;
}

/** Izgaradaki standart blog kartı (kapak + özet). Detay sayfasında da kullanılır. */
export function renderBlogCard(post: BlogPost): string {
  const arrow = `
      <span class="blog-card__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg>
      </span>`;
  return /* html */ `
  <article class="blog-card">
    <a class="${mediaClass(post, "blog-card__media")}" href="${href(
    post
    )}"${dimAttr(post)} aria-label="${esc(post.title)} kapak görseli">
      ${media(post, arrow)}
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

/** "More Articles" mobil liste satırı (küçük thumbnail + meta). */
function renderListItem(post: BlogPost): string {
  const thumb = post.coverUrl
    ? `<span class="blog-li__thumb"><img src="${esc(post.coverUrl)}" alt="${esc(
        post.coverAlt || post.title
      )}" loading="lazy" /></span>`
    : `<span class="blog-li__thumb mockup" data-dim="${esc(
        post.dim ?? ""
      )}" aria-hidden="true"></span>`;
  return /* html */ `
  <a class="blog-li" href="${href(post)}">
    ${thumb}
    <span class="blog-li__info">
      <span class="blog-li__title">${esc(post.title)}</span>
      <span class="blog-meta">${meta(post)}</span>
    </span>
  </a>`;
}

/**
 * Blog yerleşimi (öne çıkan + "Diğer Yazılar" listesi). Filtre/arama
 * sonucu değiştiğinde yalnızca bu blok yeniden boyanır (#blogLayout).
 */
export function renderBlogLayout(posts: BlogPost[]): string {
  if (!posts.length) {
    return /* html */ `
      <div class="blog__layout" id="blogLayout">
        <p class="blog__empty">Bu seçime uygun yazı bulunamadı.</p>
      </div>`;
  }

  const [featured, ...rest] = posts;
  return /* html */ `
      <div class="blog__layout" id="blogLayout">
        <div class="blog__primary">
          <p class="blog__kicker">Öne Çıkan Yazı</p>
          ${renderFeatured(featured)}
        </div>

        <aside class="blog__aside">
          <div class="blog__aside-head">
            <h3>Diğer Yazılar</h3>
            <a href="#blog" class="link-arrow link-arrow--sm">Tümü</a>
          </div>
          <div class="blog__list">
            ${rest.length ? rest.map(renderListItem).join("\n") : '<p class="blog__empty">Başka yazı yok.</p>'}
          </div>
        </aside>
      </div>`;
}

/**
 * Kategori sekmeleri + arama kutusu araç çubuğu. Ana sayfadan kaldırıldı;
 * blog detay sayfasında "Diğer Yazılar" listesini filtrelemek için kullanılır.
 * Sekme etiketleri kanonik kategori listesinden (BLOG_CATEGORIES) gelir;
 * filtreleme `src/features/blog.ts` tarafından yapılır.
 */
export function renderBlogToolbar(): string {
  const tabs = BLOG_CATEGORIES.map(
    (c, i) =>
      `<button type="button" class="blog-tab${
        i === 0 ? " is-active" : ""
      }" data-cat="${esc(c)}" role="tab" aria-selected="${i === 0}">${esc(
        c
      )}</button>`
  ).join("");

  return /* html */ `
      <div class="blog__toolbar">
        <div class="blog__tabs" role="tablist" aria-label="Blog kategorileri">${tabs}</div>
        <form class="blog__search" role="search" onsubmit="return false">
          <svg class="blog__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" placeholder="Konu ara..." aria-label="Blogda ara" />
        </form>
      </div>`;
}

/**
 * 08 — BLOG. `posts` verilirse (Supabase) dinamik; verilmezse mockup içerik.
 */
export function renderBlog(posts: BlogPost[] = BLOG_POSTS): string {
  const list = posts.length ? posts : BLOG_POSTS;

  return /* html */ `
  <section class="blog" id="blog">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">08 &nbsp;·&nbsp; Blog</span>
        <a href="#blog" class="link-arrow">Tümünü Gör</a>
      </div>

      <div class="blog__head">
        <h2>Blog &amp; Haberler</h2>
        <p>Elektrikli araç şarjı ve sigortası hakkında güncel yazılar, rehberler ve ipuçları.</p>
      </div>

      ${renderBlogLayout(list)}
    </div>
  </section>`;
}
