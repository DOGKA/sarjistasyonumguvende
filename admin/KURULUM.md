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
Bu komut şu tabloları + RLS politikalarını + storage bucket'larını
(`contact-files`, `site-media`, `blog-images`) oluşturur:

- `contact_submissions` — iletişim formu mesajları
- `risk_results` — risk testi sonuçları (cevap dökümü dahil)
- `blog_posts` — blog yazıları (zengin HTML gövde + SEO alanları)
- `site_media` — **Media** sekmesinden yönetilen site bölüm görselleri
- `page_events` — iç analitik olayları
- `blog-images` (storage) — blog kapak/gövde görselleri (herkese açık)

> **Not:** Şemayı daha önce çalıştırdıysanız, blog SEO alanları ve
> `blog-images` bucket'ı için `supabase/schema.sql` dosyasını **yeniden**
> çalıştırın. Komut idempotenttir (`add column if not exists`), mevcut
> verilere zarar vermez.

### Blog yönetimi

Panelde **Blog** sekmesi artık aktiftir:

- **Yeni yazı / Düzenle** — zengin HTML editörü (kalın, başlık, liste, alıntı,
  bağlantı, görsel yükleme + `</>` HTML kaynağı modu).
- **SEO sekmesi** — meta başlık/açıklama (karakter sayaçlı), anahtar kelimeler,
  canonical, Open Graph görseli, `noindex`, Google + sosyal medya önizlemesi ve
  SEO kontrol listesi.
- **Şablon & Rehber sekmesi** — public sitedeki blog şablonunun nasıl
  oluştuğunu ve desteklenen HTML etiketlerini anlatır.
- **Yayınla / Taslak** — yayınlanan yazılar public sitede otomatik görünür
  (`blog.html?p=SLUG` detay sayfası + ana sayfa blog bölümü). Yayında yazı
  yoksa site mevcut mockup içeriğe geri düşer.

### Media (site görselleri)

`site-media` **public** bucket'tır; görseller Supabase CDN üzerinden hızlı servis
edilir. Panelde **Media** sekmesinden Hakkımızda / Teminatlar / Neden Biz / CTA
bölümlerinin görselleri yüklenir. Her slot için önerilen en-boy oranı kartta
gösterilir; görsel sitede `object-fit: cover` ile aynı orana kırpılır, böylece
mobil ve web görünümü birebir aynı olur. Bir slot boşsa site, koda gömülü
varsayılan görseli kullanır (sıfır regresyon). Yüklenen görsel **anında yayına**
girer — yeniden build/deploy gerekmez.

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

## Risk testi sonuçları (API)

Public site, tamamlanan risk testini admin panelindeki sunucu uç noktasına
gönderir:

```
POST /api/risk-results
Content-Type: application/json
{ name, email, score, tier, tier_label, answers, total_questions }
```

Bu uç nokta kaydı **service role** ile yazar; böylece kayıt RLS politikalarına
takılmaz (CORS açıktır, public site farklı bir origin'den çağırabilir).
Public site bu adresi `.env` içindeki `VITE_RISK_API_URL` ile bulur:

```
# Public site .env
VITE_RISK_API_URL=http://localhost:8001/api/risk-results   # dev
# Prod'da panelin gerçek adresi, örn:
# VITE_RISK_API_URL=https://panel.alanadiniz.com/api/risk-results
```

`VITE_RISK_API_URL` tanımlı değilse public site doğrudan Supabase'e (anon)
yazmayı dener; bu durumda `risk_results` için `insert` RLS politikasının
yüklü olması gerekir (`supabase/schema.sql`).

## Notlar

- `service_role` / `sb_secret_` anahtarı **asla** tarayıcıya gönderilmez;
  yalnızca sunucu tarafı kodda (`src/lib/supabase/admin.ts` ve
  `/api/risk-results`) kullanılır.
- RLS sayesinde public site yalnızca form/test ekleyebilir ve yayınlanan
  blogları okuyabilir; tüm yönetim yetkisi giriş yapmış admindedir.
- Risk Testleri ve Dashboard'daki test sayıları service role ile okunur,
  bu yüzden `risk_results` üzerindeki `select` politikasından bağımsız çalışır.
