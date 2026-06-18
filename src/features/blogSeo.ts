import type { BlogPost } from "@/types";

const SITE_NAME = "Şarj İstasyonum Güvende";
const SITE_ORIGIN = "https://sarjistasyonumguvende.com";

/** name veya property meta etiketini günceller/oluşturur. */
function setMeta(attr: "name" | "property", key: string, content: string): void {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** rel=canonical bağlantısını günceller/oluşturur. */
function setCanonical(url: string): void {
  if (!url) return;
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

/**
 * Yazıya göre tüm SEO meta etiketlerini (title, description, OG, Twitter,
 * canonical, keywords, robots) günceller.
 */
export function applyBlogSeo(post: BlogPost): void {
  const title = post.metaTitle || post.title;
  const fullTitle = `${title} — ${SITE_NAME}`;
  const description = post.metaDescription || post.excerpt || "";
  const url =
    post.canonicalUrl ||
    (post.slug
      ? `${SITE_ORIGIN}/blog.html?p=${encodeURIComponent(post.slug)}`
      : `${SITE_ORIGIN}/blog.html`);
  const image = post.ogImageUrl || post.coverUrl || "";

  document.title = fullTitle;
  setMeta("name", "description", description);
  if (post.metaKeywords) setMeta("name", "keywords", post.metaKeywords);
  setMeta(
    "name",
    "robots",
    post.noindex ? "noindex,nofollow" : "index,follow"
  );

  setMeta("property", "og:type", "article");
  setMeta("property", "og:site_name", SITE_NAME);
  setMeta("property", "og:title", fullTitle);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  if (image) setMeta("property", "og:image", image);
  setMeta("property", "og:locale", "tr_TR");

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", fullTitle);
  setMeta("name", "twitter:description", description);
  if (image) setMeta("name", "twitter:image", image);

  setCanonical(url);
}
