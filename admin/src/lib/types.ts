/** Veritabanı kayıt tipleri (Supabase tablolarıyla eşleşir). */

export type ContactStatus = "new" | "read" | "answered" | "archived";

export interface ContactSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  file_url: string | null;
  file_name: string | null;
  status: ContactStatus;
  admin_note: string | null;
}

/** Risk testinde tek bir cevap kaydı. */
export interface RiskAnswer {
  section: string;
  question: string;
  answer: string;
  points: number;
}

export interface RiskResult {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  score: number;
  tier: string | null;
  tier_label: string | null;
  answers: RiskAnswer[];
  total_questions: number | null;
}

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  author: string | null;
  tags: string[];
  status: BlogStatus;
  published_at: string | null;
  read_min: number | null;
  likes: number;

  /* SEO */
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  noindex: boolean;
}

/** Editör formundan gelen, kaydedilebilir blog alanları. */
export interface BlogPostInput {
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  author: string | null;
  tags: string[];
  status: BlogStatus;
  read_min: number | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  noindex: boolean;
}

export interface PageEvent {
  id: number;
  created_at: string;
  type: string;
  path: string | null;
  meta: Record<string, unknown> | null;
}
