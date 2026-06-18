/**
 * Blog yazılarını Supabase'e ekler (service_role ile, RLS atlanır).
 *
 * Kullanım:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-blog.mjs
 *
 * Anahtarlar verilmezse otomatik olarak admin/.env.local dosyasından okunur.
 * Idempotent: aynı slug varsa atlar (upsert + ignoreDuplicates).
 *
 * İçerik kaynağı: supabase/seed-blog-content.sql ile aynı 10 yazı.
 * Kapak görselleri (cover_url) bilerek boş bırakılır.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* --------- Ortam değişkenlerini bul (env > admin/.env.local) --------- */
function readEnvFile(path) {
  try {
    const out = {};
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return out;
  } catch {
    return {};
  }
}

const adminEnv = readEnvFile(join(__dirname, "..", "admin", ".env.local"));
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  adminEnv.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || adminEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "HATA: SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli (env ya da admin/.env.local)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const AUTHOR = "Şarj İstasyonum Güvende Ekibi";
const CTA = (line) =>
  `<hr/>\n<p><strong>${line}</strong></p>\n<p><a href="/#risk-testi">👉 Şarj İstasyonunuzun Risk Skorunu Hesaplayın</a></p>`;

/* ------------------------------------------------------------------ veriler */
const POSTS = [
  {
    title: "Şarj İstasyonları Neden Sigortalanmalı? En Sık Karşılaşılan 7 Risk",
    slug: "sarj-istasyonlari-neden-sigortalanmali-7-risk",
    category: "Risk Yönetimi",
    excerpt:
      "Bir elektrikli araç şarj istasyonu, yüksek güçle çalışan ve dış etkenlere açık pahalı bir yatırımdır. İşletmeleri en çok zorlayan 7 riski ve bunlara karşı sigortanın neden zorunlu hale geldiğini açıklıyoruz.",
    content: `<p>Elektrikli araç şarj istasyonları; yüksek güçle çalışan, sürekli açık havada veya yoğun trafikte konumlanan, içinde pahalı elektronik bileşenler barındıran yatırımlardır. Tek bir arıza bile binlerce hatta yüz binlerce liralık zarara, gelir kaybına ve itibar zedelenmesine yol açabilir. Bu yazıda şarj istasyonu işletmecilerinin en sık karşılaştığı 7 riski ve sigortanın neden artık bir tercih değil, bir ihtiyaç olduğunu ele alıyoruz.</p>
<h2>Şarj istasyonlarını tehdit eden 7 temel risk</h2>
<h3>1. Güç modülü arızaları</h3>
<p>Güç modülü, bir DC hızlı şarj istasyonunun en pahalı ve en hassas bileşenidir. Aşırı ısınma, gerilim dalgalanması veya soğutma sistemindeki bir aksaklık modülü kalıcı olarak devre dışı bırakabilir. Tek bir modülün maliyeti çoğu zaman cihaz değerinin önemli bir kısmına denk gelir.</p>
<h3>2. Elektronik kart hasarları</h3>
<p>Ana kart, kontrol kartları ve haberleşme modülleri; nemden, tozdan ve gerilim sıçramalarından kolayca etkilenir. Küçük bir kart arızası bile istasyonun tamamen durmasına ve uzun süreli gelir kaybına neden olabilir.</p>
<h3>3. Yangın riskleri</h3>
<p>Gevşek bağlantılar, aşırı ısınan kablolar ve eksik koruma ekipmanları yangının başlıca sebepleridir. Yangın yalnızca cihaza değil, çevredeki araçlara ve binaya da zarar vererek çok büyük sorumluluk doğurabilir.</p>
<h3>4. Sel ve su baskını</h3>
<p>Açık otoparklarda ve zemin seviyesinde konumlanan istasyonlar, ani yağışlarda su baskınına karşı savunmasızdır. Suyla temas eden elektronik aksam çoğunlukla onarılamaz hale gelir.</p>
<h3>5. Araç çarpması</h3>
<p>Otopark ve trafik alanlarındaki istasyonlar, manevra sırasında araç çarpmasına oldukça açıktır. Fiziksel darbe; kasayı, soketi ve iç elektroniği aynı anda kullanılamaz hale getirebilir.</p>
<h3>6. Siber saldırılar</h3>
<p>İnternete bağlı, uzaktan yönetilen ve ödeme alan şarj istasyonları siber saldırıların hedefi olabilir. Bir saldırı; ödeme kesintisine, veri ihlaline ve tüm ağın durmasına yol açabilir.</p>
<h3>7. Yıldırım ve şebeke dalgalanmaları</h3>
<p>Yıldırım düşmesi ve şebekedeki ani gerilim yükselmeleri, koruma ekipmanı yetersizse istasyonun tüm elektroniğini bir anda yok edebilir. Aşırı gerilim koruması (SPD) bu noktada hayati önemdedir.</p>
<h2>Sonuç: Risk kaçınılmaz, hasar değil</h2>
<p>Bu risklerin tamamı sıfırlanamaz; ancak doğru kurulum, periyodik bakım ve kapsamlı bir sigorta poliçesiyle hasarın işletmenize maliyeti büyük ölçüde sınırlandırılabilir. Önemli olan riski yaşamadan önce hazırlıklı olmaktır.</p>
${CTA("Şarj istasyonunuzun risk seviyesini öğrenmek ister misiniz?")}`,
    tags: ["şarj istasyonu sigortası", "risk yönetimi", "ev şarj", "hasar"],
    read_min: 6,
    likes: 142,
    published_at: "2026-06-15T09:00:00Z",
    meta_title: "Şarj İstasyonu Sigortası: En Sık 7 Risk",
    meta_description:
      "Şarj istasyonlarını tehdit eden 7 temel risk: güç modülü arızası, yangın, sel, araç çarpması, siber saldırı ve daha fazlası. Sigorta neden şart?",
    meta_keywords:
      "şarj istasyonu sigortası, ev şarj riskleri, güç modülü arızası, şarj istasyonu yangın",
  },
  {
    title: "Şarj İstasyonu Sigortası Neleri Kapsar?",
    slug: "sarj-istasyonu-sigortasi-neleri-kapsar",
    category: "Sigorta Rehberleri",
    excerpt:
      "Yangın, makine kırılması, elektronik cihaz ve sorumluluk teminatları… Bir şarj istasyonu poliçesinin gerçekte neyi koruduğunu, hangi teminatların olmazsa olmaz olduğunu madde madde açıklıyoruz.",
    content: `<p>Şarj istasyonu sigortası dendiğinde çoğu işletmeci aklına yalnızca yangını getirir. Oysa kapsamlı bir poliçe; cihazın kendisini, içindeki elektroniği, üçüncü kişilere verilebilecek zararları ve hatta işin durmasından kaynaklanan gelir kaybını güvence altına alabilir. Bu rehberde bir şarj istasyonu poliçesinde yer alması gereken temel teminatları açıklıyoruz.</p>
<h2>Olmazsa olmaz temel teminatlar</h2>
<h3>Yangın teminatı</h3>
<p>Yangın, yıldırım, infilak ve bunların söndürme çalışmaları sırasında oluşan zararları kapsar. Şarj istasyonları için en temel ve en kritik teminattır.</p>
<h3>Makine kırılması</h3>
<p>Ani ve beklenmedik mekanik veya elektriksel arızaları güvence altına alır. Güç modülü ve hareketli bileşenlerdeki arızalar bu teminat kapsamında değerlendirilir.</p>
<h3>Elektronik cihaz teminatı</h3>
<p>Ana kart, kontrol kartları, ekran ve ödeme sistemleri gibi hassas elektronik bileşenlerin hasarlarını karşılar. Şarj istasyonlarındaki arızaların büyük bölümü elektronik kaynaklı olduğundan bu teminat son derece önemlidir.</p>
<h3>Sorumluluk teminatları</h3>
<p>İstasyonun üçüncü kişilere veya araçlara vereceği zararları (örneğin yangının komşu araca sıçraması) güvence altına alır. Ortak alanlarda ve halka açık noktalarda bu teminat olmazsa olmazdır.</p>
<h2>Ek olarak değerlendirilebilecek teminatlar</h2>
<ul>
<li><strong>Sel ve su baskını:</strong> Açık otopark ve zemin seviyesindeki istasyonlar için.</li>
<li><strong>Araç çarpması ve çarpışma:</strong> Trafik alanlarındaki üniteler için.</li>
<li><strong>İş durması / gelir kaybı:</strong> İstasyon devre dışı kaldığında oluşan kazanç kaybı için.</li>
<li><strong>Hırsızlık ve vandalizm:</strong> Kablo, soket ve panel hedefli zararlar için.</li>
</ul>
<h2>Sonuç</h2>
<p>Doğru bir şarj istasyonu poliçesi, tek bir teminattan değil; cihaz, elektronik, sorumluluk ve gelir kaybını birlikte kapsayan bir yapıdan oluşur. Poliçenizi alırken kapsamı satır satır kontrol etmek, hasar anında sürpriz yaşamamanın en güvenli yoludur.</p>
${CTA("Şarj istasyonunuzun hangi teminatlara ihtiyacı olduğunu öğrenin.")}`,
    tags: ["şarj istasyonu sigortası", "teminat", "sigorta rehberi"],
    read_min: 5,
    likes: 98,
    published_at: "2026-06-08T09:00:00Z",
    meta_title: "Şarj İstasyonu Sigortası Neleri Kapsar?",
    meta_description:
      "Yangın, makine kırılması, elektronik cihaz ve sorumluluk teminatları dahil bir şarj istasyonu poliçesinin kapsamını madde madde açıklıyoruz.",
    meta_keywords:
      "şarj istasyonu sigortası kapsam, makine kırılması, elektronik cihaz sigortası, sorumluluk teminatı",
  },
  {
    title: "Şarj İstasyonu Sigortası Fiyatı Nasıl Hesaplanır?",
    slug: "sarj-istasyonu-sigortasi-fiyati-nasil-hesaplanir",
    category: "Sigorta Rehberleri",
    excerpt:
      "AC mi DC mi, kaç kW, hangi lokasyonda, kaç adet? Şarj istasyonu sigorta primini belirleyen başlıca faktörleri ve maliyeti aşağı çekmenin yollarını anlatıyoruz.",
    content: `<p>Şarj istasyonu sigortası priminin tek bir sabit fiyatı yoktur; cihazın türünden konumuna kadar birçok değişkene göre hesaplanır. Bu yazıda primi belirleyen ana faktörleri ve poliçe maliyetinizi nasıl optimize edebileceğinizi açıklıyoruz.</p>
<h2>Primi belirleyen başlıca faktörler</h2>
<h3>AC / DC farkı</h3>
<p>DC hızlı şarj istasyonları, içlerindeki güç modülleri ve yüksek teknolojik bileşenler nedeniyle AC istasyonlara göre çok daha değerlidir. Bu nedenle DC cihazların sigorta primi genellikle daha yüksektir.</p>
<h3>Güç kapasitesi</h3>
<p>İstasyonun kW cinsinden gücü arttıkça hem cihaz değeri hem de yangın ve arıza riski yükselir. 180 kW bir DC ünitenin priminin, 22 kW bir AC üniteden yüksek olması beklenir.</p>
<h3>Lokasyon</h3>
<p>Sel riski olan bir bölge, yoğun trafikli bir otopark veya gözetimsiz açık alan; primi yukarı çeker. Korunaklı, kameralı ve güvenli lokasyonlar ise riski azaltır.</p>
<h3>Cihaz adedi</h3>
<p>Birden fazla ünitenin tek poliçe altında sigortalanması genellikle birim başına maliyeti düşürür. Filo ve ağ işletmecileri için toplu poliçeler daha avantajlıdır.</p>
<h2>Maliyeti aşağı çekmenin yolları</h2>
<ul>
<li>SPD, RCD ve termal koruma gibi önlemlerle riski belgelemek.</li>
<li>Periyodik bakım kayıtlarını düzenli tutmak.</li>
<li>Birden fazla cihazı tek poliçede toplamak.</li>
<li>Uygun bir muafiyet (tenzili) oranı seçmek.</li>
</ul>
<h2>Sonuç</h2>
<p>Sigorta primi; cihaz tipi, güç, lokasyon ve adet gibi ölçülebilir faktörlerin bir sonucudur. Riskinizi azaltan teknik önlemleri belgelemek, hem güvenliği artırır hem de prim maliyetinizi düşürür.</p>
${CTA("İstasyonunuzun risk profilini görün, doğru primi öğrenin.")}`,
    tags: ["şarj istasyonu sigortası", "prim", "fiyat", "ac dc"],
    read_min: 5,
    likes: 87,
    published_at: "2026-06-01T09:00:00Z",
    meta_title: "Şarj İstasyonu Sigortası Fiyatı Nasıl Hesaplanır?",
    meta_description:
      "AC/DC farkı, güç kapasitesi, lokasyon ve cihaz adedi şarj istasyonu sigorta primini nasıl etkiler? Maliyeti düşürmenin yolları.",
    meta_keywords:
      "şarj istasyonu sigortası fiyat, sigorta primi hesaplama, ac dc şarj sigorta, ev şarj sigorta maliyeti",
  },
  {
    title:
      "Elektrikli Araç Şarj İstasyonlarında Yangın Riski Nasıl Azaltılır?",
    slug: "sarj-istasyonlarinda-yangin-riski-nasil-azaltilir",
    category: "Risk Yönetimi",
    excerpt:
      "Kablo sıcaklıkları, termal kamera kontrolleri, doğru topraklama ve SPD kullanımı… Şarj istasyonlarında yangın riskini ölçülebilir biçimde azaltan teknik önlemleri sıralıyoruz.",
    content: `<p>Yüksek güçle çalışan şarj istasyonlarında yangın, hem en yıkıcı hem de büyük ölçüde önlenebilir risklerden biridir. Yangınların çoğu ani bir patlama değil; aylarca fark edilmeyen ısınma, gevşek bağlantı ve eksik koruma sonucu oluşur. Bu yazıda yangın riskini somut olarak düşüren teknik önlemleri ele alıyoruz.</p>
<h2>Yangını önleyen teknik önlemler</h2>
<h3>Kablo sıcaklıklarının izlenmesi</h3>
<p>Yüksek akım taşıyan kablolar ve bağlantı noktaları zamanla ısınır. Sıcaklık sensörleri ve düzenli ölçümlerle bu noktalardaki anormal ısınma erkenden tespit edilebilir; çoğu yangın daha başlamadan engellenir.</p>
<h3>Termal kamera kontrolleri</h3>
<p>Periyodik termal kamera taramaları, çıplak gözle görülemeyen sıcak noktaları (hot spot) ortaya çıkarır. Gevşek bir klemens veya aşırı yüklenen bir bağlantı, henüz arıza vermeden görüntülenebilir.</p>
<h3>Doğru topraklama</h3>
<p>Yetersiz veya hatalı topraklama; kaçak akımların ve aşırı gerilimlerin güvenli biçimde tahliye edilememesine, dolayısıyla yangın ve elektrik çarpması riskine yol açar. Topraklama ölçümleri düzenli yapılmalıdır.</p>
<h3>SPD (aşırı gerilim koruması) kullanımı</h3>
<p>Yıldırım ve şebeke dalgalanmalarına karşı kurulan SPD cihazları, ani gerilim sıçramalarını yutar. Doğru sınıfta seçilmiş bir SPD, hem yangını hem de elektronik hasarı önemli ölçüde azaltır.</p>
<h2>Önlemleri tamamlayan kontrol listesi</h2>
<ul>
<li>Bağlantı noktalarının periyodik tork kontrolü.</li>
<li>Havalandırma ve soğutma sisteminin temizliği.</li>
<li>RCD koruması ve kaçak akım testleri.</li>
<li>Yangın söndürücü ve algılama sistemlerinin yakın konumlandırılması.</li>
</ul>
<h2>Sonuç</h2>
<p>Yangın, şarj istasyonu işletmeciliğinin en büyük korkusu olsa da büyük ölçüde önlenebilir bir risktir. Düzenli izleme, doğru topraklama ve koruma ekipmanları; hem can ve mal güvenliğini hem de yatırımınızı korur.</p>
${CTA("Yangın riskiniz ne durumda? Hemen ölçün.")}`,
    tags: ["yangın riski", "termal kamera", "topraklama", "spd"],
    read_min: 5,
    likes: 76,
    published_at: "2026-05-25T09:00:00Z",
    meta_title: "Şarj İstasyonlarında Yangın Riski Nasıl Azaltılır?",
    meta_description:
      "Kablo sıcaklıkları, termal kamera kontrolü, topraklama ve SPD kullanımıyla şarj istasyonlarında yangın riskini azaltmanın yolları.",
    meta_keywords:
      "şarj istasyonu yangın, kablo sıcaklığı, termal kamera, topraklama, spd aşırı gerilim koruması",
  },
  {
    title: "AC ve DC Şarj İstasyonları Arasındaki Farklar",
    slug: "ac-ve-dc-sarj-istasyonlari-arasindaki-farklar",
    category: "Teknik Bilgiler",
    excerpt:
      "AC ve DC şarj arasındaki teknik fark nedir, hangi yatırım hangi lokasyona uygundur ve bu seçim sigorta riskini nasıl değiştirir? Yatırımcılar için net bir karşılaştırma.",
    content: `<p>Bir şarj istasyonu yatırımına başlarken verilecek ilk kararlardan biri AC mi yoksa DC mi kurulacağıdır. Bu seçim yalnızca şarj hızını değil; yatırım maliyetini, bakım ihtiyacını ve sigorta riskini de doğrudan etkiler. Bu yazıda iki teknolojiyi yatırımcı ve işletmeci gözüyle karşılaştırıyoruz.</p>
<h2>Temel fark: dönüştürme nerede yapılır?</h2>
<p>AC şarjda elektriğin doğru akıma (DC) dönüştürülmesi aracın içindeki şarj ünitesi tarafından yapılır; bu nedenle şarj daha yavaştır. DC şarjda ise dönüştürme istasyonun içindeki güç modüllerinde gerçekleşir ve doğrudan bataryaya yüksek güçle aktarılır; bu da çok daha hızlı şarj demektir.</p>
<h3>AC şarj istasyonları</h3>
<ul>
<li><strong>Güç:</strong> Genellikle 7,4 - 22 kW.</li>
<li><strong>Şarj süresi:</strong> Birkaç saat (gece boyu veya uzun park için ideal).</li>
<li><strong>Maliyet:</strong> Daha düşük kurulum ve cihaz maliyeti.</li>
<li><strong>Uygun lokasyon:</strong> Ev, site, otel, işyeri, AVM otoparkları.</li>
</ul>
<h3>DC hızlı şarj istasyonları</h3>
<ul>
<li><strong>Güç:</strong> 50 kW'tan başlayıp 350 kW'a kadar.</li>
<li><strong>Şarj süresi:</strong> 20-40 dakikada büyük oranda dolum.</li>
<li><strong>Maliyet:</strong> Yüksek cihaz ve altyapı yatırımı.</li>
<li><strong>Uygun lokasyon:</strong> Otoyol, akaryakıt istasyonu, yoğun transit noktaları.</li>
</ul>
<h2>Sigorta ve risk açısından fark</h2>
<p>DC istasyonlar; pahalı güç modülleri, yüksek ısı ve daha karmaşık elektronik nedeniyle hem arıza hem yangın riski açısından daha yüksek profilde değerlendirilir. Bu durum sigorta primine de yansır. AC istasyonlar görece düşük riskli olsa da, ortak kullanım alanlarında sorumluluk teminatı yine de kritiktir.</p>
<h2>Sonuç</h2>
<p>Doğru seçim, lokasyonunuza ve hedef kitlenize bağlıdır: uzun park sürelerinde AC, hızlı geçiş noktalarında DC öne çıkar. Hangi teknolojiyi seçerseniz seçin, risk yönetimi ve sigorta planlamasını yatırımın başında yapmak en doğrusudur.</p>
${CTA("Yatırımınızın risk seviyesini baştan belirleyin.")}`,
    tags: ["ac dc", "teknik", "şarj istasyonu", "yatırım"],
    read_min: 4,
    likes: 64,
    published_at: "2026-05-18T09:00:00Z",
    meta_title: "AC ve DC Şarj İstasyonları Arasındaki Farklar",
    meta_description:
      "AC ve DC şarj istasyonları arasındaki teknik farklar, hangi lokasyona hangi tipin uygun olduğu ve sigorta riskine etkisi.",
    meta_keywords:
      "ac dc şarj farkı, hızlı şarj, ac şarj istasyonu, dc şarj istasyonu, şarj yatırımı",
  },
  {
    title: "Şarj İstasyonlarında En Sık Görülen Elektronik Arızalar",
    slug: "sarj-istasyonlarinda-en-sik-gorulen-elektronik-arizalar",
    category: "Risk Yönetimi",
    excerpt:
      "Güç modülü, ana kart, haberleşme modülü, ekran ve ödeme sistemleri… Şarj istasyonlarını en çok devre dışı bırakan elektronik arızaları ve bunların sigorta açısından anlamını açıklıyoruz.",
    content: `<p>Şarj istasyonlarında arızaların büyük bölümü mekanik değil elektroniktir. Üstelik bu arızaların onarımı çoğu zaman pahalı, parça temini uzun ve cihazın devre dışı kaldığı süre gelir kaybı demektir. Bu yazıda sahada en sık karşılaşılan elektronik arızaları ve neden kapsamlı bir elektronik cihaz teminatına ihtiyaç duyduğunuzu açıklıyoruz.</p>
<h2>En sık görülen elektronik arızalar</h2>
<h3>Güç modülü arızaları</h3>
<p>DC istasyonların kalbi olan güç modülleri; aşırı ısınma, gerilim dalgalanması ve soğutma sorunları nedeniyle arızalanabilir. En maliyetli arıza türlerinden biridir ve genellikle modülün tamamen değişimini gerektirir.</p>
<h3>Ana kart (kontrol kartı) arızaları</h3>
<p>İstasyonun tüm süreçlerini yöneten ana kart; nem, toz ve gerilim sıçramalarına karşı hassastır. Bir ana kart arızası, istasyonun tamamen durmasına yol açar.</p>
<h3>Haberleşme modülü arızaları</h3>
<p>İstasyonun merkezi sistemle, ödeme altyapısıyla ve uygulamayla iletişimini sağlayan modüllerdeki sorunlar; cihaz fiziksel olarak çalışsa bile şarj başlatılamamasına veya ücretlendirilememesine neden olur.</p>
<h3>Ekran ve ödeme sistemleri</h3>
<p>Dokunmatik ekranlar, POS ve kart okuyucular; sürekli dış kullanım nedeniyle yıpranır. Ödeme alınamadığında istasyon teknik olarak çalışsa da gelir üretemez.</p>
<h2>Bu arızalar neden kritik?</h2>
<ul>
<li>Parça temini ve onarım süresi uzun olabilir.</li>
<li>Cihaz devre dışı kaldığı sürece gelir kaybı yaşanır.</li>
<li>Tek bir arıza müşteri güvenini ve tekrar kullanımı azaltır.</li>
</ul>
<h2>Sonuç</h2>
<p>Elektronik arızalar çoğu zaman önceden belirti verir; uzaktan izleme ve periyodik bakımla erken yakalanabilir. Yine de tamamı önlenemeyeceğinden, kapsamlı bir elektronik cihaz teminatı bu pahalı arızalara karşı en güçlü kalkandır.</p>
${CTA("İstasyonunuzun arıza riskini değerlendirin.")}`,
    tags: ["elektronik arıza", "güç modülü", "ana kart", "bakım"],
    read_min: 5,
    likes: 71,
    published_at: "2026-05-11T09:00:00Z",
    meta_title: "Şarj İstasyonlarında En Sık Elektronik Arızalar",
    meta_description:
      "Güç modülü, ana kart, haberleşme modülü, ekran ve ödeme sistemi arızaları: şarj istasyonlarını en çok durduran sorunlar ve çözümleri.",
    meta_keywords:
      "şarj istasyonu arıza, güç modülü arızası, ana kart, haberleşme modülü, ödeme sistemi arızası",
  },
  {
    title: "Site ve Rezidanslarda Şarj İstasyonu Sigortası Rehberi",
    slug: "site-ve-rezidanslarda-sarj-istasyonu-sigortasi-rehberi",
    category: "İşletmeciler İçin",
    excerpt:
      "Ortak kullanım alanındaki şarj üniteleri kimin sorumluluğunda? Site yönetimleri ve apartmanlar için şarj istasyonu sigortasında dikkat edilmesi gereken her şey.",
    content: `<p>Sitelerde ve rezidanslarda ortak otoparka kurulan şarj üniteleri, birden fazla kullanıcının paylaştığı ve sorumluluğu çoğu zaman belirsiz kalan bir alandır. Bir kaza, yangın veya cihaz arızası durumunda fatura kime çıkar? Bu rehberde site yönetimleri için şarj istasyonu sigortasının kritik noktalarını açıklıyoruz.</p>
<h2>Ortak kullanımda sorumluluk kimde?</h2>
<p>Ortak alana kurulan bir şarj ünitesinde yangın çıkması veya bir kullanıcının zarar görmesi durumunda, sorumluluk çoğunlukla site yönetimine ve dolayısıyla kat maliklerine yönelir. Bu nedenle cihaz sigortasının yanında <strong>sorumluluk teminatı</strong> burada olmazsa olmazdır.</p>
<h2>Site yönetimlerinin dikkat etmesi gerekenler</h2>
<ul>
<li><strong>Cihaz teminatı:</strong> Yangın, makine kırılması ve elektronik hasarlar.</li>
<li><strong>Sorumluluk teminatı:</strong> Üçüncü kişilere ve araçlara verilebilecek zararlar.</li>
<li><strong>Vandalizm ve hırsızlık:</strong> Kablo ve soket hedefli zararlar.</li>
<li><strong>Kurulumun yetkili firmaca yapılması:</strong> Hatalı montaj hem riski hem hukuki sorumluluğu artırır.</li>
</ul>
<h2>Faturalandırma ve kullanım düzeni</h2>
<p>Ünitenin kim tarafından, nasıl ücretlendirileceği ve bakım sorumluluğunun kimde olduğu yönetim planında net biçimde belirlenmelidir. Belirsizlik, hasar anında anlaşmazlığa ve teminat dışı kalmaya yol açabilir.</p>
<h2>Sonuç</h2>
<p>Sitelerde şarj ünitesi, sakinlere değer katan bir hizmettir; ancak doğru sigorta ve net bir sorumluluk planı olmadan yönetime ciddi risk yükleyebilir. En doğrusu, cihazı kurarken sigorta ve sorumluluk düzenlemesini birlikte planlamaktır.</p>
${CTA("Sitenizdeki ünitenin risk skorunu öğrenin.")}`,
    tags: ["site yönetimi", "rezidans", "ortak kullanım", "sorumluluk"],
    read_min: 5,
    likes: 58,
    published_at: "2026-05-04T09:00:00Z",
    meta_title: "Site ve Rezidanslarda Şarj İstasyonu Sigortası",
    meta_description:
      "Ortak kullanım şarj üniteleri kimin sorumluluğunda? Site ve rezidanslar için şarj istasyonu sigortası rehberi ve dikkat edilecek noktalar.",
    meta_keywords:
      "site şarj istasyonu sigortası, rezidans şarj, ortak kullanım şarj, apartman ev şarj sorumluluk",
  },
  {
    title: "Oteller İçin EV Şarj İstasyonu Sigortası",
    slug: "oteller-icin-ev-sarj-istasyonu-sigortasi",
    category: "İşletmeciler İçin",
    excerpt:
      "Şarj imkânı sunan oteller hem misafir çekiyor hem de yeni bir sorumluluk üstleniyor. Turizm tesislerinde şarj istasyonu sigortasının neden ayrı bir önem taşıdığını anlatıyoruz.",
    content: `<p>Elektrikli araç sahibi misafirler için otelde şarj imkânı artık önemli bir tercih sebebi. Ancak bir şarj istasyonu kurmak, otele yeni bir gelir ve pazarlama avantajının yanında yeni bir risk ve sorumluluk da getirir. Bu yazıda oteller ve turizm tesisleri için şarj istasyonu sigortasının neden ayrı düşünülmesi gerektiğini açıklıyoruz.</p>
<h2>Otelde şarj istasyonu neden risk doğurur?</h2>
<p>Otopark genellikle misafirlere açıktır, kullanıcı profili sürekli değişir ve cihaz çoğunlukla gözetimsiz kalır. Bir yangının komşu araçlara sıçraması, bir misafirin elektrik çarpmasıyla zarar görmesi veya cihazın arızalanıp hizmet verememesi; doğrudan otelin sorumluluğuna girer.</p>
<h2>Oteller için kritik teminatlar</h2>
<ul>
<li><strong>Sorumluluk teminatı:</strong> Misafirlere ve üçüncü kişilere verilebilecek zararlar için.</li>
<li><strong>Yangın ve makine kırılması:</strong> Cihazın kendi değerini korumak için.</li>
<li><strong>Elektronik cihaz teminatı:</strong> Ödeme ve kontrol sistemleri için.</li>
<li><strong>Gelir kaybı:</strong> Yoğun sezonda cihazın durması itibar ve kazanç kaybı demektir.</li>
</ul>
<h2>İtibar da bir risktir</h2>
<p>Bir misafirin aracını şarj edememesi veya bir kaza yaşaması, çevrim içi yorumlara ve marka imajına yansır. Turizm sektöründe itibar kaybı çoğu zaman maddi hasardan daha pahalıya mal olur.</p>
<h2>Sonuç</h2>
<p>Otelde şarj istasyonu, doğru kurgulandığında güçlü bir rekabet avantajıdır. Ancak bu avantajı korumak için sorumluluk, cihaz ve gelir kaybı teminatlarını birlikte içeren bir sigorta planı şarttır.</p>
${CTA("Otelinizdeki istasyonun risk durumunu görün.")}`,
    tags: ["otel", "turizm", "sorumluluk", "misafir"],
    read_min: 4,
    likes: 49,
    published_at: "2026-04-27T09:00:00Z",
    meta_title: "Oteller İçin EV Şarj İstasyonu Sigortası",
    meta_description:
      "Şarj imkânı sunan oteller için sigorta neden kritik? Misafir sorumluluğu, gelir kaybı ve teminatlar dahil turizm tesisleri rehberi.",
    meta_keywords:
      "otel şarj istasyonu, turizm tesisi ev şarj, otel şarj sigortası, misafir sorumluluk",
  },
  {
    title: "Şarj İstasyonu Hasarlarının %80'i Nasıl Önlenebilir?",
    slug: "sarj-istasyonu-hasarlarinin-80-i-nasil-onlenebilir",
    category: "Risk Yönetimi",
    excerpt:
      "Periyodik bakım, yazılım güncellemeleri ve uzaktan izleme ile şarj istasyonu hasarlarının büyük bölümü daha oluşmadan önlenebilir. İşte kanıtlanmış bir koruma yaklaşımı.",
    content: `<p>Şarj istasyonlarında yaşanan hasarların önemli bir kısmı, aslında erken fark edilebilecek küçük belirtilerin göz ardı edilmesinden kaynaklanır. Doğru bir bakım ve izleme disipliniyle bu hasarların büyük bölümü daha ortaya çıkmadan engellenebilir. Bu yazıda hasarları azaltan üç temel yaklaşımı açıklıyoruz.</p>
<h2>Hasarların büyük bölümünü önleyen 3 yaklaşım</h2>
<h3>1. Periyodik bakım</h3>
<p>Bağlantı noktalarının tork kontrolü, soğutma ve havalandırmanın temizliği, topraklama ve kaçak akım ölçümleri… Düzenli bakım, küçük sorunların büyük arızalara dönüşmeden giderilmesini sağlar. Bakımı planlı yapmak, hem güvenlik hem de sigorta açısından kayıt altına alınması gereken bir disiplindir.</p>
<h3>2. Yazılım güncellemeleri</h3>
<p>Şarj istasyonları artık yazılım yoğun cihazlardır. Güncel olmayan yazılımlar; haberleşme hataları, ödeme sorunları ve siber güvenlik açıkları doğurur. Düzenli güncelleme, hem performansı hem güvenliği korur.</p>
<h3>3. Uzaktan izleme</h3>
<p>Sıcaklık, gerilim ve hata kayıtlarının uzaktan izlenmesi; bir arıza belirtisini saha ekibi fark etmeden tespit etmeyi sağlar. Erken uyarı, çoğu zaman pahalı bir hasarı küçük bir müdahaleyle önler.</p>
<h2>Önleme her zaman onarımdan ucuzdur</h2>
<p>Bu üç yaklaşım birlikte uygulandığında, hasarların büyük bölümü daha oluşmadan engellenir; oluşanlar ise erken yakalandığı için çok daha düşük maliyetle giderilir.</p>
<h2>Sonuç</h2>
<p>Önleyici bakım, yazılım disiplini ve uzaktan izleme; hasar oranını ciddi biçimde düşürür. Kalan riski ise kapsamlı bir sigorta ile güvence altına almak, işletmenizi sürpriz maliyetlerden korur.</p>
${CTA("Önleyebileceğiniz riskleri şimdi görün.")}`,
    tags: ["periyodik bakım", "uzaktan izleme", "önleyici bakım"],
    read_min: 5,
    likes: 63,
    published_at: "2026-04-20T09:00:00Z",
    meta_title: "Şarj İstasyonu Hasarlarının %80'i Nasıl Önlenir?",
    meta_description:
      "Periyodik bakım, yazılım güncellemeleri ve uzaktan izleme ile şarj istasyonu hasarlarının büyük bölümünü önlemenin yolları.",
    meta_keywords:
      "şarj istasyonu bakım, önleyici bakım, uzaktan izleme, yazılım güncelleme, hasar önleme",
  },
  {
    title:
      "EV Şarj İstasyonu Yatırımı Yaparken Dikkat Edilmesi Gerekenler",
    slug: "ev-sarj-istasyonu-yatirimi-dikkat-edilmesi-gerekenler",
    category: "Güncel ve SEO Odaklı",
    excerpt:
      "Lokasyon, güç kapasitesi, geri ödeme süresi ve risk yönetimi… Elektrikli araç şarj istasyonu yatırımında kâr ile zarar arasındaki farkı belirleyen kritik kararları özetliyoruz.",
    content: `<p>Elektrikli araç pazarı büyüdükçe şarj istasyonu yatırımı cazip bir iş modeli haline geliyor. Ancak yanlış lokasyon, yetersiz güç planlaması veya ihmal edilen risk yönetimi, beklenen getiriyi hızla zarara çevirebilir. Bu yazıda yatırım öncesinde mutlaka değerlendirmeniz gereken kritik başlıkları sıralıyoruz.</p>
<h2>Yatırım öncesi değerlendirilmesi gereken başlıklar</h2>
<h3>Lokasyon</h3>
<p>Trafik yoğunluğu, park süresi ve hedef kullanıcı profili; gelirinizi belirleyen en önemli faktördür. Otoyol kenarı DC için, uzun park alanları ise AC için uygundur. Sel riski ve güvenlik de lokasyon kararına dahil edilmelidir.</p>
<h3>Güç kapasitesi ve altyapı</h3>
<p>Mevcut elektrik altyapısının seçtiğiniz güce uygun olup olmadığı, trafo ve abonelik maliyetleri yatırımın geri dönüşünü doğrudan etkiler. Yetersiz altyapı sonradan büyük ek maliyet doğurur.</p>
<h3>Geri ödeme süresi</h3>
<p>Cihaz maliyeti, elektrik gideri, işletme ve bakım masrafları ile beklenen kullanım yoğunluğu birlikte değerlendirilmeli; gerçekçi bir geri ödeme planı çıkarılmalıdır.</p>
<h3>Risk yönetimi ve sigorta</h3>
<p>Yangın, sel, araç çarpması, arıza ve siber saldırı gibi riskler yatırımın getirisini bir anda silebilir. Risk yönetimini ve sigortayı yatırımın sonuna değil başına koymak, kârlılığı koruyan en önemli karardır.</p>
<h2>Sık yapılan hatalar</h2>
<ul>
<li>Sadece cihaz fiyatına bakıp altyapı maliyetini göz ardı etmek.</li>
<li>Lokasyonu kullanıcı yoğunluğuna göre değil, kolay erişime göre seçmek.</li>
<li>Bakım ve sigorta giderlerini iş planına dahil etmemek.</li>
</ul>
<h2>Sonuç</h2>
<p>Kârlı bir şarj istasyonu yatırımı; doğru lokasyon, sağlam altyapı, gerçekçi finansal plan ve baştan kurgulanmış bir risk yönetiminin birleşimidir. Bu dört başlığı birlikte ele almak, yatırımınızı uzun vadede güvence altına alır.</p>
${CTA("Yatırımınızın risk skorunu daha başlamadan öğrenin.")}`,
    tags: ["yatırım", "lokasyon", "geri ödeme", "risk yönetimi"],
    read_min: 6,
    likes: 81,
    published_at: "2026-04-13T09:00:00Z",
    meta_title: "EV Şarj İstasyonu Yatırımında Dikkat Edilecekler",
    meta_description:
      "Lokasyon, güç kapasitesi, geri ödeme süresi ve risk yönetimi: kârlı bir EV şarj istasyonu yatırımı için bilmeniz gereken her şey.",
    meta_keywords:
      "şarj istasyonu yatırımı, ev şarj yatırım, geri ödeme süresi, şarj istasyonu lokasyon, yatırım riski",
  },
];

/* ------------------------------------------------------------------ çalıştır */
async function main() {
  const rows = POSTS.map((p) => ({
    title: p.title,
    slug: p.slug,
    category: p.category,
    excerpt: p.excerpt,
    content: p.content,
    cover_url: null,
    cover_alt: null,
    author: AUTHOR,
    tags: p.tags,
    status: "published",
    read_min: p.read_min,
    likes: p.likes,
    published_at: p.published_at,
    created_at: p.published_at,
    updated_at: p.published_at,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    meta_keywords: p.meta_keywords,
  }));

  // Mevcut slug'ları çek — idempotentlik için yalnızca eksikleri ekleyelim.
  const slugs = rows.map((r) => r.slug);
  const { data: existing, error: selErr } = await supabase
    .from("blog_posts")
    .select("slug")
    .in("slug", slugs);

  if (selErr) {
    console.error("✗ Mevcut yazılar okunamadı:", selErr.message);
    process.exit(1);
  }

  const have = new Set((existing ?? []).map((r) => r.slug));
  const toInsert = rows.filter((r) => !have.has(r.slug));

  if (toInsert.length === 0) {
    console.log("Tüm yazılar zaten mevcut — eklenecek yeni kayıt yok.");
    return;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(toInsert)
    .select("slug, status");

  if (error) {
    console.error("✗ Ekleme hatası:", error.message);
    process.exit(1);
  }

  console.log(`✓ ${data.length} yazı eklendi:`);
  for (const r of data) console.log(`   • [${r.status}] ${r.slug}`);
  if (have.size) console.log(`(Atlanan mevcut: ${have.size})`);
}

main();
