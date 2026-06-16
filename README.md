# Şarj İstasyonum Güvende

Elektrikli araç şarj istasyonu sigortası tanıtım sitesi. **Vite + TypeScript** ile geliştirilmiştir; her bölüm (section) ayrı bir modülde, etkileşimler ise tiplenmiş `features` modüllerinde tutulur.

## Gereksinimler

- Node.js 18+ (öneri: 18.20 veya 20+)
- Bir OpenChargeMap API anahtarı — https://openchargemap.org/site/develop/api

## Kurulum

```bash
npm install
cp .env.example .env   # ve VITE_OCM_API_KEY değerini girin
npm run dev            # geliştirme sunucusu (http://localhost:5173)
```

> Harita üzerinde "en yakın istasyon" araması tarayıcı konumunu kullanabildiğinden
> `localhost` veya `https` üzerinden çalıştırılması gerekir.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu (HMR) |
| `npm run build` | Tip kontrolü + production derlemesi (`dist/`) |
| `npm run preview` | Derlenmiş çıktıyı önizleme |
| `npm run typecheck` | Yalnızca TypeScript tip kontrolü |

## Ortam Değişkenleri

Vite yalnızca `VITE_` önekli değişkenleri tarayıcıya açar.

| Değişken | Açıklama |
| --- | --- |
| `VITE_OCM_API_KEY` | OpenChargeMap API anahtarı |

## Klasör Yapısı

```
.
├── index.html              # Vite girişi (yalnızca #app kabuğu)
├── public/
│   └── assets/             # Statik görseller (/assets/... olarak sunulur)
├── src/
│   ├── main.ts             # Uygulama girişi: bölümleri birleştirir + init eder
│   ├── config.ts           # Ortam değişkenleri ve sabitler
│   ├── types.ts            # Paylaşılan tip tanımları
│   ├── vite-env.d.ts       # import.meta.env tipleri
│   ├── lib/
│   │   └── dom.ts          # DOM yardımcıları (esc, qs, qsa...)
│   ├── data/               # İçerik verisi (reviews, quiz)
│   ├── sections/           # Her bölümün HTML üretici fonksiyonu
│   │   ├── hero.ts  about.ts  stations.ts  solutions.ts
│   │   ├── product.ts  reviews.ts  risk.ts  mission.ts
│   │   └── cta.ts  footer.ts
│   ├── features/           # Etkileşim mantığı (tiplenmiş)
│   │   ├── heroVideo.ts
│   │   ├── productCarousel.ts
│   │   ├── reviewsCarousel.ts
│   │   ├── riskQuiz.ts  riskBackground.ts
│   │   └── map/            # OpenChargeMap haritası
│   │       ├── ocmMap.ts   # Leaflet orkestrasyonu
│   │       ├── ocmApi.ts   # OCM API çağrıları
│   │       └── geo.ts      # Geocode + konum
│   └── styles/             # Bölüm bazlı CSS (main.css hepsini @import eder)
├── kaynaklar/              # Yerel kaynak materyaller (git'e dahil değil)
└── ...
```

## Yeni bir bölüm eklemek

1. `src/sections/yeniBolum.ts` içinde HTML üreten bir `renderYeniBolum()` yazın.
2. Gerekiyorsa stilini `src/styles/yeniBolum.css` olarak ekleyip `main.css`'e `@import` edin.
3. Etkileşim varsa `src/features/` altında bir `initYeniBolum()` modülü oluşturun.
4. `src/main.ts` içinde render + init çağrılarını ekleyin.

## İleride: Admin

Yönetim paneli için ayrı bir alan planlanmaktadır (örn. `src/admin/` veya ayrı bir
Vite girişi `admin.html`). Mevcut bölüm/veri ayrımı bu geçişi kolaylaştıracak şekilde
kurgulanmıştır. Bu sürümde admin **dahil değildir**.
