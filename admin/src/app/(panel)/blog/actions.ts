"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify, estimateReadMin } from "@/lib/blog";
import type { BlogPostInput, BlogStatus } from "@/lib/types";

/** Editör girdisini DB satırına çevirir (boş stringleri null'a indirger). */
function normalize(input: BlogPostInput) {
  const nz = (v: string | null) => {
    const t = (v ?? "").trim();
    return t === "" ? null : t;
  };
  const slug = slugify(input.slug || input.title);
  return {
    title: input.title.trim(),
    slug,
    category: nz(input.category),
    excerpt: nz(input.excerpt),
    content: input.content ?? null,
    cover_url: nz(input.cover_url),
    cover_alt: nz(input.cover_alt),
    author: nz(input.author),
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    status: input.status,
    read_min: input.read_min ?? estimateReadMin(input.content),
    meta_title: nz(input.meta_title),
    meta_description: nz(input.meta_description),
    meta_keywords: nz(input.meta_keywords),
    canonical_url: nz(input.canonical_url),
    og_image_url: nz(input.og_image_url),
    noindex: Boolean(input.noindex),
  };
}

/** Yeni blog yazısı oluşturur. Başarılıysa { id } döner. */
export async function createPost(input: BlogPostInput) {
  if (!input.title.trim()) return { error: "Başlık zorunludur." };
  const supabase = await createClient();
  const row = normalize(input);

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      ...row,
      published_at: row.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505")
      return { error: "Bu slug zaten kullanılıyor. Farklı bir slug deneyin." };
    return { error: error.message };
  }
  revalidatePath("/blog");
  return { id: data.id as string };
}

/** Mevcut blog yazısını günceller. */
export async function updatePost(id: string, input: BlogPostInput) {
  if (!input.title.trim()) return { error: "Başlık zorunludur." };
  const supabase = await createClient();
  const row = normalize(input);

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .single();

  let published_at = existing?.published_at ?? null;
  if (row.status === "published" && !published_at)
    published_at = new Date().toISOString();
  if (row.status === "draft") published_at = null;

  const { error } = await supabase
    .from("blog_posts")
    .update({ ...row, published_at })
    .eq("id", id);

  if (error) {
    if (error.code === "23505")
      return { error: "Bu slug zaten kullanılıyor. Farklı bir slug deneyin." };
    return { error: error.message };
  }
  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
  return { ok: true };
}

/** Yayın durumunu değiştirir (liste ekranındaki hızlı eylem). */
export async function setPostStatus(id: string, status: BlogStatus) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { status };
  if (status === "published") patch.published_at = new Date().toISOString();
  if (status === "draft") patch.published_at = null;

  const { error } = await supabase.from("blog_posts").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  return { ok: true };
}

/** Blog yazısını siler. */
export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  return { ok: true };
}

/** Slug'ın benzersiz olup olmadığını kontrol eder (editörde canlı uyarı için). */
export async function isSlugAvailable(slug: string, excludeId?: string) {
  const supabase = await createClient();
  let query = supabase.from("blog_posts").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.limit(1);
  return { available: (data ?? []).length === 0 };
}

/** blog-images bucket'ına görsel yükler, herkese açık URL döner. */
export async function uploadBlogImage(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { error: "Geçerli bir görsel seçilmedi." };
  if (!file.type.startsWith("image/"))
    return { error: "Yalnızca görsel dosyaları yüklenebilir." };
  if (file.size > 5 * 1024 * 1024)
    return { error: "Görsel en fazla 5 MB olabilir." };

  const supabase = await createClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return { url: data.publicUrl };
}
