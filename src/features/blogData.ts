import { getSupabase } from "@/lib/supabase";
import type { BlogPost } from "@/types";

/** Supabase blog_posts satırı (public okuma — yalnızca yayınlananlar). */
interface BlogRow {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  author: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  read_min: number | null;
  likes: number | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  noindex: boolean | null;
}

/** ISO tarihi okunur Türkçe metne çevirir ("4 Ekim 2021"). */
function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** DB satırını render modeline (BlogPost) çevirir. */
function toPost(row: BlogRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category ?? "Blog",
    title: row.title,
    excerpt: row.excerpt ?? "",
    date: formatDate(row.published_at ?? row.created_at),
    readMin: row.read_min ?? 3,
    likes: row.likes ?? 0,
    content: row.content ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    coverAlt: row.cover_alt ?? undefined,
    author: row.author ?? undefined,
    tags: row.tags ?? undefined,
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
    metaKeywords: row.meta_keywords ?? undefined,
    canonicalUrl: row.canonical_url ?? undefined,
    ogImageUrl: row.og_image_url ?? undefined,
    noindex: row.noindex ?? undefined,
  };
}

const SELECT =
  "id,title,slug,category,excerpt,content,cover_url,cover_alt,author,tags,published_at,created_at,read_min,likes,meta_title,meta_description,meta_keywords,canonical_url,og_image_url,noindex";

/**
 * Yayınlanmış yazıları getirir (en yeni önce).
 * Supabase yapılandırılmamışsa veya hata olursa null döner;
 * çağıran taraf mockup içeriğe geri düşer.
 */
export async function fetchPublishedPosts(
  limit = 12
): Promise<BlogPost[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error || !data) return null;
    return (data as BlogRow[]).map(toPost);
  } catch {
    return null;
  }
}

/** Tek bir yayınlanmış yazıyı slug ile getirir. Bulunamazsa null. */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(SELECT)
      .eq("status", "published")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return toPost(data as BlogRow);
  } catch {
    return null;
  }
}
