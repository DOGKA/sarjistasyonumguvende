import { esc } from "@/lib/dom";
import { BLOG_POSTS } from "@/data/blog";
import { renderBlogCard } from "@/sections/blog";
import type { BlogPost } from "@/types";

/** Gövde paragrafları (yalnızca mockup/içeriksiz yazılar için yedek). */
const BODY_PARAGRAPHS: string[] = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
];

/** Yedek (mockup) gövde — gerçek HTML içerik yoksa kullanılır. */
function fallbackBody(): string {
  return /* html */ `
    ${BODY_PARAGRAPHS.map((p) => `<p>${esc(p)}</p>`).join("\n")}
    <h2>Ut enim ad minim veniam</h2>
    <p>${esc(BODY_PARAGRAPHS[0])}</p>
    <blockquote>"Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, quis nostrud exercitation ullamco."</blockquote>`;
}

/** Kapak görseli bloğu: gerçek görsel varsa <img>, yoksa mockup. */
function cover(post: BlogPost): string {
  if (post.coverUrl) {
    return `<div class="blogd__cover"><img src="${esc(
      post.coverUrl
    )}" alt="${esc(post.coverAlt || post.title)}" /></div>`;
  }
  return `<div class="blogd__cover mockup" data-dim="${esc(
    post.dim ?? "1200 × 720"
  )}" aria-hidden="true"></div>`;
}

/** Etiket rozetleri (varsa). */
function tags(post: BlogPost): string {
  if (!post.tags?.length) return "";
  return `<div class="blogd__tags">${post.tags
    .map((t) => `<span class="blog-tag">#${esc(t)}</span>`)
    .join("")}</div>`;
}

/**
 * BLOG DETAY — tek yazı görünümü + altında "Diğer Yazılar".
 * `post` verilirse (Supabase) dinamik; verilmezse ilk mockup yazı gösterilir.
 */
export function renderBlogDetail(
  post: BlogPost = BLOG_POSTS[0],
  others: BlogPost[] = BLOG_POSTS.slice(1)
): string {
  const body = post.content?.trim() ? post.content : fallbackBody();
  const author = post.author || "Şarj İstasyonum Ekibi";

  return /* html */ `
  <main class="blogd">
    <article class="container blogd__article">
      <a href="/#blog" class="blogd__back"><span aria-hidden="true">←</span> Tüm yazılar</a>

      <header class="blogd__head">
        <span class="blog-tag">${esc(post.category)}</span>
        <h1 class="blogd__title">${esc(post.title)}</h1>
        <div class="blogd__byline">
          <span class="blogd__author">
            <span>
              <span class="blogd__author-name">${esc(author)}</span>
              <span class="blog-meta">${esc(post.date)} &nbsp;·&nbsp; ${
    post.readMin
  } dk okuma</span>
            </span>
          </span>
          <button type="button" class="blogd__save" aria-label="Yazıyı kaydet">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>
          </button>
        </div>
      </header>

      ${cover(post)}

      ${post.excerpt ? `<p class="blog-feature__excerpt" style="font-size:18px;margin-bottom:24px;">${esc(post.excerpt)}</p>` : ""}

      <div class="blogd__body">
        ${body}
      </div>

      ${tags(post)}

      <div
        class="blogd__share"
        data-share-root
        data-title="${esc(post.title)}"
        data-category="${esc(post.category)}"
        data-date="${esc(post.date)}"
      >
        <span class="blogd__share-label">Bu yazıyı paylaş</span>
        <div class="blogd__share-btns">
          <button type="button" class="share-btn share-btn--wa" data-share="whatsapp" aria-label="WhatsApp'ta paylaş">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.82c2.15 0 4.17.84 5.69 2.36a8.02 8.02 0 0 1 2.36 5.7c0 4.45-3.62 8.08-8.08 8.08a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.06.8.82-2.98-.2-.31a8.04 8.04 0 0 1-1.26-4.32c0-4.45 3.62-8.08 8.08-8.08Zm-2.7 4.3c-.16 0-.4.06-.61.29-.21.23-.81.79-.81 1.92 0 1.13.83 2.22.94 2.38.12.16 1.62 2.47 3.93 3.46.55.24.97.38 1.31.49.55.17 1.05.15 1.45.09.44-.07 1.36-.56 1.56-1.09.19-.54.19-1 .13-1.09-.05-.1-.21-.16-.45-.27-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.52.12-.16.23-.6.76-.74.91-.13.16-.27.18-.5.06-.24-.12-1-.37-1.9-1.18-.7-.62-1.18-1.4-1.31-1.63-.14-.23-.01-.36.1-.48.11-.1.24-.27.36-.41.12-.14.16-.23.24-.39.08-.16.04-.3-.02-.41-.06-.12-.52-1.27-.73-1.74-.19-.45-.39-.39-.52-.4l-.45-.01Z"/></svg>
            WhatsApp
          </button>
          <button type="button" class="share-btn share-btn--ig" data-share="instagram" aria-label="Instagram'da paylaş">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
            Instagram
          </button>
        </div>
      </div>
    </article>

    ${
      others.length
        ? `<section class="blogd__more">
      <div class="container">
        <div class="blogd__more-head">
          <h2>Diğer Yazılar</h2>
          <a href="/#blog" class="link-arrow">Tümünü Gör</a>
        </div>
        <div class="blog__grid">
          ${others.map(renderBlogCard).join("\n")}
        </div>
      </div>
    </section>`
        : ""
    }
  </main>`;
}
