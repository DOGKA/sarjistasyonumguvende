import { qsOpt, qsa } from "@/lib/dom";
import { fetchPublishedPosts } from "@/features/blogData";
import { renderBlog, renderBlogCard } from "@/sections/blog";
import type { BlogPost } from "@/types";

/** Türkçe-duyarlı küçük harfe çevirme (arama karşılaştırması için). */
function lower(s: string): string {
  return s.toLocaleLowerCase("tr");
}

/**
 * Ana sayfa blog bölümünü Supabase'teki yayınlanmış yazılarla günceller.
 * İlk boyamada mockup içerik gösterilir (hızlı), ardından gerçek yazılar
 * varsa bölüm yerinde değiştirilir. Yazı yoksa/yapılandırma yoksa mockup kalır.
 */
export async function initBlog(): Promise<void> {
  const section = qsOpt<HTMLElement>("#blog");
  if (!section) return;

  const posts = await fetchPublishedPosts(12);
  if (!posts || posts.length === 0) return;

  section.outerHTML = renderBlog(posts);
}

/**
 * Blog detay sayfasındaki kategori sekmelerini ve arama kutusunu işlevsel
 * hale getirir: tıklama/yazma sırasında yalnızca #blogdMoreGrid (Diğer
 * Yazılar ızgarası) yeniden boyanır.
 */
export function initBlogDetailFilter(others: BlogPost[]): void {
  const grid = qsOpt<HTMLElement>("#blogdMoreGrid");
  if (!grid) return;

  const tabs = qsa<HTMLButtonElement>(".blog-tab");
  const search = qsOpt<HTMLInputElement>(".blog__search input");

  let activeCat = "Tümü";

  const apply = (): void => {
    const q = lower((search?.value ?? "").trim());
    const filtered = others.filter((p) => {
      const catOk = activeCat === "Tümü" || (p.category ?? "") === activeCat;
      if (!catOk) return false;
      if (!q) return true;
      const hay = lower(`${p.title} ${p.excerpt} ${p.category ?? ""}`);
      return hay.includes(q);
    });

    grid.innerHTML = filtered.length
      ? filtered.map(renderBlogCard).join("\n")
      : '<p class="blog__empty">Bu seçime uygun yazı bulunamadı.</p>';
  };

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      activeCat = btn.dataset.cat ?? "Tümü";
      apply();
    });
  });

  search?.addEventListener("input", apply);
}
