/**
 * Sitedeki yönetilebilir görsel "slot"larının tanımı.
 *
 * Her slot, ana sitedeki `data-media="<key>"` özniteliğine sahip bir <img>'e
 * karşılık gelir. Oran (ratio) bilgisi, sitedeki CSS kutusunun en-boy oranıyla
 * birebir aynıdır; böylece yüklenen görsel hem mobilde hem webte aynı şekilde
 * kırpılır (object-fit: cover) ve bölümler arasında fark oluşmaz.
 */
export interface MediaSlot {
  key: string;
  label: string;
  ratio: string; // CSS aspect-ratio (örn. "4 / 3")
  ratioLabel: string; // kullanıcıya gösterilen oran
  recommended: string; // önerilen piksel boyutu
}

export interface MediaSection {
  id: string;
  title: string;
  slots: MediaSlot[];
}

export const MEDIA_SECTIONS: MediaSection[] = [
  {
    id: "hakkimizda",
    title: "01 · Hakkımızda",
    slots: [
      {
        key: "about_main",
        label: "Ana görsel",
        ratio: "4 / 3",
        ratioLabel: "4:3",
        recommended: "1200×900 px",
      },
    ],
  },
  {
    id: "teminatlar",
    title: "02 · Teminatlar",
    slots: [
      {
        key: "product_intro",
        label: "Kapsamlı Koruma (giriş)",
        ratio: "16 / 11",
        ratioLabel: "16:11",
        recommended: "1280×880 px",
      },
      {
        key: "product_fire",
        label: "Yangın Teminatı",
        ratio: "16 / 11",
        ratioLabel: "16:11",
        recommended: "1280×880 px",
      },
      {
        key: "product_machine",
        label: "Makine Kırılması",
        ratio: "16 / 11",
        ratioLabel: "16:11",
        recommended: "1280×880 px",
      },
      {
        key: "product_disaster",
        label: "Doğal Afet",
        ratio: "16 / 11",
        ratioLabel: "16:11",
        recommended: "1280×880 px",
      },
      {
        key: "product_cyber",
        label: "Siber Risk",
        ratio: "16 / 11",
        ratioLabel: "16:11",
        recommended: "1280×880 px",
      },
      {
        key: "product_electronic",
        label: "Elektronik Cihaz",
        ratio: "16 / 11",
        ratioLabel: "16:11",
        recommended: "1280×880 px",
      },
    ],
  },
  {
    id: "neden-biz",
    title: "03 · Neden Biz",
    slots: [
      {
        key: "solutions_risk",
        label: "Risk Mühendisliği",
        ratio: "16 / 9",
        ratioLabel: "16:9",
        recommended: "1280×720 px",
      },
      {
        key: "solutions_damage",
        label: "Hızlı Hasar Yönetimi",
        ratio: "16 / 9",
        ratioLabel: "16:9",
        recommended: "1280×720 px",
      },
    ],
  },
  {
    id: "cta",
    title: "CTA · Footer",
    slots: [
      {
        key: "cta_visual",
        label: "Daha Fazla (görsel)",
        ratio: "16 / 11",
        ratioLabel: "16:11",
        recommended: "1280×880 px",
      },
      {
        key: "cta_graphic",
        label: "EV şarj konnektörü",
        ratio: "3 / 2",
        ratioLabel: "3:2",
        recommended: "1200×800 px",
      },
    ],
  },
];

export const ALL_SLOT_KEYS: string[] = MEDIA_SECTIONS.flatMap((s) =>
  s.slots.map((slot) => slot.key)
);
