# Şarj İstasyonum Güvende

Elektrikli araç şarj istasyonu sigortası tanıtım sitesi. **Vite + TypeScript** ile geliştirilmiştir; her bölüm (section) ayrı bir modülde, etkileşimler ise tiplenmiş `features` modüllerinde tutulur.

## Gereksinimler

- Node.js 18+ (öneri: 18.20 veya 20+)
- Bir OpenChargeMap API anahtarı — https://openchargemap.org/site/develop/api

## Kurulum

```bash
npm install
cp .env.example .env   # ve VITE_OCM_API_KEY değerini girin
npm run dev            # geliştirme sunucusu (http://localhost:8000)
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
| `npm run scrape:prices` | Şarj tarifelerini toplayıp `public/data/charging-prices.json` dosyasını günceller |

## Ortam Değişkenleri

Vite yalnızca `VITE_` önekli değişkenleri tarayıcıya açar.

| Değişken | Açıklama |
| --- | --- |
| `VITE_OCM_API_KEY` | OpenChargeMap API anahtarı |

## Klasör Yapısı

```
.
├── index.html              # Vite girişi (yalnızca #app kabuğu)
├── scripts/
│   └── scrape-prices.mjs   # Günlük şarj tarifesi toplayıcı (Node, ESM)
├── .github/workflows/
│   └── scrape-prices.yml   # Günlük scraper otomasyonu (cron)
├── public/
│   ├── assets/             # Statik görseller (/assets/... olarak sunulur)
│   └── data/               # ev-models.json + charging-prices.json (/data/...)
├── src/
│   ├── main.ts             # Uygulama girişi: bölümleri birleştirir + init eder
│   ├── config.ts           # Ortam değişkenleri ve sabitler
│   ├── types.ts            # Paylaşılan tip tanımları
│   ├── vite-env.d.ts       # import.meta.env tipleri
│   ├── lib/
│   │   └── dom.ts          # DOM yardımcıları (esc, qs, qsa...)
│   ├── data/               # İçerik verisi (reviews, quiz) + veri yükleyiciler (evModels)
│   ├── sections/           # Her bölümün HTML üretici fonksiyonu
│   │   ├── hero.ts  about.ts  stations.ts  solutions.ts
│   │   ├── calculator.ts  product.ts  reviews.ts  risk.ts
│   │   └── mission.ts  cta.ts  footer.ts
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

## Şarj Maliyet Hesaplayıcı (05)

`#hesaplayici` bölümü, kullanıcının aracını ve şarj aralığını seçerek operatörlere
göre tahmini şarj maliyetini karşılaştırmasını sağlar.

- **Bölüm/HTML:** `src/sections/calculator.ts` (`renderCalculator()`)
- **Etkileşim:** `src/features/calculator.ts` (`initCalculator()`)
- **Stil:** `src/styles/calculator.css`
- **Veri yükleyiciler/tipler:** `src/data/evModels.ts`, `src/types.ts`
- **Veri dosyaları:** `public/data/ev-models.json`, `public/data/charging-prices.json`
  (çalışma zamanında `/data/...` adresinden `fetch` edilir).

Hesaplama: `enerji (kWh) = kullanılabilir batarya × (hedef − mevcut) / 100`,
`maliyet = enerji × ₺/kWh`. Ayrıca seçilen araç/aralık için **tüm operatörler**
en uygundan pahalıya sıralanarak karşılaştırılır. "Manuel giriş" ile özel batarya,
tüketim ve ₺/kWh değerleri girilebilir.

### Tarife toplayıcı (scraper)

`scripts/scrape-prices.mjs`, ek bağımlılık olmadan (Node 18+ yerleşik `fetch`)
6 operatörün (Trugo, ZES, Voltrun, Tesla Supercharger, Shell Recharge, Wat
Mobilite) sayfalarını indirip TL/kWh tarifelerini ayıklamaya çalışır ve sonucu
`public/data/charging-prices.json` dosyasına yazar.

- Her operatör **bağımsız** işlenir; biri başarısız olursa script çökmez, o
  operatör için makul **manuel** değerlere düşülür ve `source: "manual"` ile bir
  `note` eklenir. Canlı çekilenler `source: "scraped"` olarak işaretlenir.
- Bazı siteler bot engeli koyabilir veya fiyatları JS ile oluşturduğundan statik
  HTML'den okunamayabilir; bu beklenen bir durumdur.

Çalıştırma:

```bash
npm run scrape:prices
```

### Günlük otomasyon

**1) cron (sunucu/yerel):** Her gün 08:00'de çalıştırıp depoya commit'lemek için:

```cron
0 8 * * *  cd /path/to/doga-danismanlik-ev-charge && /usr/bin/node scripts/scrape-prices.mjs && git add public/data/charging-prices.json && git commit -m "chore: günlük tarife güncellemesi" && git push
```

**2) GitHub Actions:** `.github/workflows/scrape-prices.yml` her gün çalışır
(`schedule` cron) ve değişiklik varsa JSON'u commit'ler. Elle tetiklemek için
Actions sekmesinden `workflow_dispatch` kullanılabilir.

```yaml
on:
  schedule:
    - cron: "0 5 * * *"   # 05:00 UTC ≈ 08:00 TR
  workflow_dispatch: {}
```

### Fiyat ve model verilerini elle düzenlemek

- **Fiyatlar:** `public/data/charging-prices.json` içindeki ilgili operatörün
  `tariffs` dizisini güncelleyin (`pricePerKwh` değeri). Elle girilen değerler için
  `source` alanını `"manual"` yapıp kısa bir `note` ekleyin. Scraper bir sonraki
  çalışmada canlı veriyle üzerine yazabilir; sabit kalmasını istediğiniz değerler
  için ilgili operatörü `scripts/scrape-prices.mjs` içindeki `manual` listesinde
  güncelleyin.
- **Araçlar:** `public/data/ev-models.json` içindeki ilgili markanın `models`
  dizisine yeni bir kayıt ekleyin (`usableBatteryKwh`, `avgConsumptionKwhPer100km`,
  `maxAcKw`, `maxDcKw`, opsiyonel `variant` ve `wltpRangeKm`). Yeni marka için
  `brands` dizisine `id`, `name`, opsiyonel `color` ve `models` ile bir kayıt ekleyin.

## Yeni bir bölüm eklemek

1. `src/sections/yeniBolum.ts` içinde HTML üreten bir `renderYeniBolum()` yazın.
2. Gerekiyorsa stilini `src/styles/yeniBolum.css` olarak ekleyip `main.css`'e `@import` edin.
3. Etkileşim varsa `src/features/` altında bir `initYeniBolum()` modülü oluşturun.
4. `src/main.ts` içinde render + init çağrılarını ekleyin.

## İleride: Admin

Yönetim paneli için ayrı bir alan planlanmaktadır (örn. `src/admin/` veya ayrı bir
Vite girişi `admin.html`). Mevcut bölüm/veri ayrımı bu geçişi kolaylaştıracak şekilde
kurgulanmıştır. Bu sürümde admin **dahil değildir**.
