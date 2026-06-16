import type { QuizSection, QuizResultTier } from "@/types";

export const quizSections: QuizSection[] = [
  {
    name: "İstasyon Profili",
    questions: [
      { q: "Şarj istasyonunuzun bulunduğu <em>alan</em> nedir?", o: [
        ["Site / Residence", 5], ["İş Yeri", 4], ["AVM", 3],
        ["Akaryakıt İstasyonu", 1], ["Filo Sahası", 3], ["Endüstriyel Tesis", 2],
      ]},
      { q: "Toplam kaç <em>şarj üniteniz</em> bulunuyor?", o: [
        ["1-2", 5], ["3-10", 4], ["11-25", 3], ["26-50", 2], ["50+", 1],
      ]},
      { q: "Şarj cihazlarınızın çoğu hangi <em>tiptedir</em>?", o: [
        ["AC", 5], ["DC Hızlı Şarj", 3], ["Ultra Hızlı DC", 2], ["Karışık", 3],
      ]},
      { q: "İstasyonlarınızın <em>yaşı</em> nedir?", o: [
        ["1 yıldan az", 5], ["1-3 yıl", 4], ["3-5 yıl", 3], ["5 yıldan fazla", 1],
      ]},
    ],
  },
  {
    name: "Elektrik ve Teknik Güvenlik",
    questions: [
      { q: "Son periyodik <em>bakım</em> ne zaman yapıldı?", o: [
        ["Son 3 ay", 5], ["Son 6 ay", 4], ["Son 12 ay", 2], ["12 aydan uzun süre önce", 0],
      ]},
      { q: "<em>Topraklama</em> ölçümleri düzenli yapılıyor mu?", o: [
        ["Evet", 5], ["Kısmen", 3], ["Hayır", 0], ["Bilmiyorum", 1],
      ]},
      { q: "<em>Parafudr (SPD)</em> koruması mevcut mu?", o: [
        ["Evet", 5], ["Kısmen", 3], ["Hayır", 0], ["Emin değilim", 1],
      ]},
      { q: "Son 24 ayda elektrik kaynaklı <em>arıza</em> yaşandı mı?", o: [
        ["Hayır", 5], ["1 kez", 3], ["Birkaç kez", 1], ["Sık sık", 0],
      ]},
    ],
  },
  {
    name: "Yangın ve Fiziksel Güvenlik",
    questions: [
      { q: "Yangın <em>algılama</em> sistemi mevcut mu?", o: [
        ["Evet", 5], ["Kısmen", 3], ["Hayır", 0],
      ]},
      { q: "Yangın <em>söndürme</em> ekipmanları mevcut mu?", o: [
        ["Evet", 5], ["Kısmen", 3], ["Hayır", 0],
      ]},
      { q: "Alan <em>7/24 kamera</em> ile izleniyor mu?", o: [
        ["Evet", 5], ["Kısmen", 3], ["Hayır", 0],
      ]},
      { q: "Son 3 yılda <em>vandalizm, çarpma</em> veya fiziksel hasar yaşandı mı?", o: [
        ["Hayır", 5], ["1 kez", 3], ["Birden fazla kez", 0],
      ]},
    ],
  },
  {
    name: "Siber Güvenlik ve Operasyon",
    questions: [
      { q: "Şarj istasyonlarınız <em>internete</em> bağlı mı?", o: [
        ["Evet", 3], ["Hayır", 5],
      ]},
      { q: "<em>Yazılım güncellemeleri</em> düzenli uygulanıyor mu?", o: [
        ["Evet", 5], ["Bazen", 3], ["Hayır", 0], ["Bilmiyorum", 1],
      ]},
      { q: "Yönetim panelinde <em>çok faktörlü doğrulama (2FA)</em> kullanılıyor mu?", o: [
        ["Evet", 5], ["Hayır", 0], ["Bilmiyorum", 1],
      ]},
      { q: "<em>Uzaktan izleme</em> ve hata bildirim sistemi mevcut mu?", o: [
        ["Evet", 5], ["Kısmen", 3], ["Hayır", 0],
      ]},
    ],
  },
  {
    name: "Sigorta ve Risk Yönetimi",
    questions: [
      { q: "Şarj istasyonunuza özel <em>sigorta teminatı</em> bulunuyor mu?", o: [
        ["Evet", 5], ["Kısmen", 3], ["Hayır", 0],
      ]},
      { q: "Son 3 yılda sigortaya konu olabilecek bir <em>hasar</em> yaşadınız mı?", o: [
        ["Hayır", 5], ["1 kez", 3], ["Birden fazla kez", 0],
      ]},
      { q: "Bir ünitenin <em>7 gün devre dışı</em> kalması sizi ne kadar etkiler?", o: [
        ["Çok az", 5], ["Orta", 4], ["Ciddi", 2], ["Kritik", 1],
      ]},
      { q: "Risk yönetimi ve <em>bakım kayıtlarını</em> düzenli tutuyor musunuz?", o: [
        ["Evet", 5], ["Kısmen", 3], ["Hayır", 0],
      ]},
    ],
  },
];

export const quizIntroLines: string[] = [
  "Her şarj istasyonunun <em>görünmeyen</em> bir riski vardır.",
  "Çoğu zaman fark edilmeden büyür.",
  "Riskinizi <em>2 dakikada</em> keşfedin.",
];

export const quizResultTiers: QuizResultTier[] = [
  { min: 80, emoji: "🟢", label: "Düşük Risk", cls: "is-risk-low",
    desc: "İstasyon altyapınız genel olarak iyi korunuyor." },
  { min: 60, emoji: "🟠", label: "Kontrollü Risk", cls: "is-risk-controlled",
    desc: "Bazı alanlarda iyileştirme fırsatları bulunuyor." },
  { min: 40, emoji: "🟡", label: "Yüksek Dikkat Gerekiyor", cls: "is-risk-attention",
    desc: "Hasar ve kesinti riskleri sektör ortalamasının üzerinde." },
  { min: 0, emoji: "🔴", label: "Kritik Risk", cls: "is-risk-critical",
    desc: "İstasyonlarınız önemli operasyonel ve finansal risklere maruz kalabilir." },
];
