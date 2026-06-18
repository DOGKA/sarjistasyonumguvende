-- =====================================================================
--  Şarj İstasyonum Güvende — Supabase şeması
--  Supabase SQL Editor'da bu dosyanın tamamını çalıştırın.
--  (Dashboard > SQL Editor > New query > yapıştır > Run)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) İLETİŞİM FORMU GÖNDERİMLERİ
-- ---------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  file_url    text,            -- Supabase Storage'daki dosya yolu (varsa)
  file_name   text,
  status      text not null default 'new'
              check (status in ('new', 'read', 'answered', 'archived')),
  admin_note  text
);

create index if not exists contact_submissions_created_idx
  on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

-- ---------------------------------------------------------------------
-- 2) RİSK TESTİ SONUÇLARI
-- ---------------------------------------------------------------------
create table if not exists public.risk_results (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  email       text,
  score       integer not null,            -- 0-100
  tier        text,                         -- sonuç sınıfı (cls)
  tier_label  text,                         -- sonuç etiketi (görünen)
  answers     jsonb not null default '[]'::jsonb,  -- [{section, question, answer, points}]
  total_questions integer
);

create index if not exists risk_results_created_idx
  on public.risk_results (created_at desc);

-- ---------------------------------------------------------------------
-- 3) BLOG YAZILARI
-- ---------------------------------------------------------------------
create table if not exists public.blog_posts (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  title         text not null,
  slug          text not null unique,
  category      text,
  excerpt       text,
  content       text,            -- zengin HTML gövde (editörden gelir)
  cover_url     text,
  cover_alt     text,            -- kapak görseli alt metni (SEO/erişilebilirlik)
  author        text,            -- yazar adı (byline)
  tags          text[] not null default '{}',  -- etiketler
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  published_at  timestamptz,
  read_min      integer default 3,
  likes         integer not null default 0,

  -- ----------------- SEO ALANLARI -----------------
  meta_title       text,         -- <title> / og:title (boşsa title kullanılır)
  meta_description text,          -- <meta name="description"> / og:description
  meta_keywords    text,          -- virgülle ayrılmış anahtar kelimeler
  canonical_url    text,          -- rel=canonical (boşsa slug'dan üretilir)
  og_image_url     text,          -- sosyal paylaşım görseli (boşsa cover_url)
  noindex          boolean not null default false  -- robots noindex,nofollow
);

-- Mevcut tablolar için eksik kolonları ekle (idempotent)
alter table public.blog_posts add column if not exists cover_alt        text;
alter table public.blog_posts add column if not exists author           text;
alter table public.blog_posts add column if not exists tags             text[] not null default '{}';
alter table public.blog_posts add column if not exists meta_title       text;
alter table public.blog_posts add column if not exists meta_description text;
alter table public.blog_posts add column if not exists meta_keywords    text;
alter table public.blog_posts add column if not exists canonical_url    text;
alter table public.blog_posts add column if not exists og_image_url     text;
alter table public.blog_posts add column if not exists noindex          boolean not null default false;

create index if not exists blog_posts_status_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_slug_idx
  on public.blog_posts (slug);

-- updated_at otomatik güncelleme
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4) SİTE GÖRSELLERİ (admin panelinden yönetilen bölüm görselleri)
--    Her "slot" sitedeki bir <img>'e karşılık gelir (data-media ile eşleşir).
--    url boş/NULL ise site, koda gömülü varsayılan görseli kullanır.
-- ---------------------------------------------------------------------
create table if not exists public.site_media (
  slot_key    text primary key,           -- örn. 'about_main', 'product_fire'
  url         text,                        -- Supabase Storage public URL'i (override)
  updated_at  timestamptz not null default now()
);

drop trigger if exists site_media_set_updated_at on public.site_media;
create trigger site_media_set_updated_at
  before update on public.site_media
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5) SAYFA / ETKİLEŞİM OLAYLARI (iç analitik)
-- ---------------------------------------------------------------------
create table if not exists public.page_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  type        text not null,   -- 'page_view' | 'quiz_start' | 'quiz_complete' | 'contact_submit' | ...
  path        text,
  meta        jsonb
);

create index if not exists page_events_type_created_idx
  on public.page_events (type, created_at desc);

-- =====================================================================
--  ROW LEVEL SECURITY (RLS)
--  - anon (public site): blog'u OKUR, form/test/olay EKLER
--  - authenticated (admin): her şeyi yapar
--  - service_role: RLS'yi atlar (admin sunucu tarafı)
-- =====================================================================

alter table public.contact_submissions enable row level security;
alter table public.risk_results        enable row level security;
alter table public.blog_posts           enable row level security;
alter table public.page_events          enable row level security;
alter table public.site_media           enable row level security;

-- --- İletişim: herkes ekleyebilir, sadece giriş yapmış admin görür/günceller
drop policy if exists contact_insert_anon on public.contact_submissions;
create policy contact_insert_anon on public.contact_submissions
  for insert to anon, authenticated with check (true);

drop policy if exists contact_admin_all on public.contact_submissions;
create policy contact_admin_all on public.contact_submissions
  for all to authenticated using (true) with check (true);

-- --- Risk testi: herkes ekleyebilir, sadece admin görür
drop policy if exists risk_insert_anon on public.risk_results;
create policy risk_insert_anon on public.risk_results
  for insert to anon, authenticated with check (true);

drop policy if exists risk_admin_all on public.risk_results;
create policy risk_admin_all on public.risk_results
  for all to authenticated using (true) with check (true);

-- --- Blog: herkes YAYINLANANLARI okur, admin hepsini yönetir
drop policy if exists blog_select_published on public.blog_posts;
create policy blog_select_published on public.blog_posts
  for select to anon, authenticated using (status = 'published');

drop policy if exists blog_admin_all on public.blog_posts;
create policy blog_admin_all on public.blog_posts
  for all to authenticated using (true) with check (true);

-- --- Olaylar: herkes ekler, sadece admin okur
drop policy if exists events_insert_anon on public.page_events;
create policy events_insert_anon on public.page_events
  for insert to anon, authenticated with check (true);

drop policy if exists events_admin_select on public.page_events;
create policy events_admin_select on public.page_events
  for select to authenticated using (true);

-- --- Site görselleri: herkes OKUR (public site), admin yönetir
drop policy if exists site_media_select_all on public.site_media;
create policy site_media_select_all on public.site_media
  for select to anon, authenticated using (true);

drop policy if exists site_media_admin_all on public.site_media;
create policy site_media_admin_all on public.site_media
  for all to authenticated using (true) with check (true);

-- =====================================================================
--  STORAGE — iletişim formu belge ekleri
--  Not: Bucket'ı Dashboard > Storage'dan da oluşturabilirsiniz.
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('contact-files', 'contact-files', false)
on conflict (id) do nothing;

-- anon kullanıcı yükleyebilir (form eki), sadece admin okur
drop policy if exists contact_files_insert on storage.objects;
create policy contact_files_insert on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'contact-files');

drop policy if exists contact_files_admin_read on storage.objects;
create policy contact_files_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'contact-files');

-- =====================================================================
--  STORAGE — site görselleri (public bucket, CDN üzerinden hızlı servis)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

-- Herkes okuyabilir (public bucket); sadece admin yükler/günceller/siler
drop policy if exists site_media_public_read on storage.objects;
create policy site_media_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-media');

drop policy if exists site_media_admin_write on storage.objects;
create policy site_media_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'site-media')
  with check (bucket_id = 'site-media');

-- =====================================================================
--  STORAGE — blog görselleri (kapak + gövde içi görseller)
--  Public bucket: herkes okur, sadece giriş yapmış admin yükler/siler.
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists blog_images_public_read on storage.objects;
create policy blog_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'blog-images');

drop policy if exists blog_images_admin_write on storage.objects;
create policy blog_images_admin_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog-images');

drop policy if exists blog_images_admin_update on storage.objects;
create policy blog_images_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'blog-images');

drop policy if exists blog_images_admin_delete on storage.objects;
create policy blog_images_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog-images');
