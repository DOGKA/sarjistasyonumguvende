import { qsOpt } from "@/lib/dom";
import { fetchPublishedPosts } from "@/features/blogData";
import { renderBlog } from "@/sections/blog";

/**
 * Ana sayfa blog bölümünü Supabase'teki yayınlanmış yazılarla günceller.
 * İlk boyamada mockup içerik gösterilir (hızlı), ardından gerçek yazılar
 * varsa bölüm yerinde değiştirilir. Yazı yoksa/yapılandırma yoksa mockup kalır.
 */
export async function initBlog(): Promise<void> {
  const section = qsOpt<HTMLElement>("#blog");
  if (!section) return;

  const posts = await fetchPublishedPosts(7);
  if (!posts || posts.length === 0) return;

  section.outerHTML = renderBlog(posts);
}
