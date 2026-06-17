# Yönetim Paneli — Kurulum

Admin paneli **Next.js** ile yazıldı ve `http://localhost:8001` üzerinde çalışır.
Veriler **Supabase** (Postgres + Auth + Storage) üzerinde tutulur.

## 1) Bağımlılıklar

```bash
cd admin
npm install
```

## 2) Ortam değişkenleri

`admin/.env.local` dosyası (gizli, git'e gönderilmez):

```
NEXT_PUBLIC_SUPABASE_URL=https://pkfvjdpuxlyjccumrhzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # publishable key
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...            # secret key (yalnızca sunucu)
NEXT_PUBLIC_GA_ID=G-WPHMDM83ZX
```

Public site (kök dizin) `.env` dosyası da aynı URL + publishable key'i `VITE_`
önekiyle kullanır.

## 3) Veritabanı şeması (BİR KEZ)

Supabase panelinde **SQL Editor > New query** açın, depodaki
`supabase/schema.sql` dosyasının **tamamını** yapıştırıp **Run** edin.
Bu komut şu tabloları + RLS politikalarını + `contact-files` storage bucket'ını
oluşturur:

- `contact_submissions` — iletişim formu mesajları
- `risk_results` — risk testi sonuçları (cevap dökümü dahil)
- `blog_posts` — blog yazıları
- `page_events` — iç analitik olayları

## 4) Admin kullanıcısı oluştur (giriş için)

Supabase panelinde **Authentication > Users > Add user > Create new user**:

- E-posta + şifre girin
- "Auto Confirm User" işaretli olsun (e-posta doğrulaması istemesin)

Bu e-posta/şifre ile `http://localhost:8001/login` üzerinden giriş yapılır.
(Tek admin modeli; yeni kullanıcı eklemek için yine bu ekran kullanılır.)

## 5) Çalıştır

```bash
# Admin paneli (port 8001)
cd admin && npm run dev

# Public site (port 8000) — ayrı bir terminalde
npm run dev
```

## Notlar

- `service_role` / `sb_secret_` anahtarı **asla** tarayıcıya gönderilmez;
  yalnızca sunucu tarafı kodda (`src/lib/supabase/admin.ts`) kullanılır.
- RLS sayesinde public site yalnızca form/test ekleyebilir ve yayınlanan
  blogları okuyabilir; tüm yönetim yetkisi giriş yapmış admindedir.
