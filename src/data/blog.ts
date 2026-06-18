import type { BlogPost } from "@/types";

/**
 * Blog kategori sekmeleri. İlk sekme her zaman "Tümü" (filtre kapalı).
 * Buradaki liste, admin panelindeki kategori listesi ve seed'lenen
 * yazıların kategorileriyle aynı olmalıdır.
 */
export const BLOG_CATEGORIES: string[] = [
  "Tümü",
  "Risk Yönetimi",
  "Sigorta Rehberleri",
  "İşletmeciler İçin",
  "Teknik Bilgiler",
  "Güncel ve SEO Odaklı",
  "Vaka Analizleri",
];

/**
 * Blog yazıları — mockup içerik (lorem ipsum).
 * Görseller yerine ölçü etiketli placeholder kullanılır (`dim`).
 * İlk kayıt "Today's Article" (öne çıkan) olarak gösterilir.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    category: "Design",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
    date: "October 4, 2021",
    readMin: 3,
    dim: "1200 × 720",
    likes: 128,
  },
  {
    category: "Lorem",
    title: "Make A Successful Instagram",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    date: "October 4, 2021",
    readMin: 3,
    dim: "640 × 420",
    likes: 15,
  },
  {
    category: "Ipsum",
    title: "Get Started In 3D Animation",
    excerpt:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    date: "October 4, 2021",
    readMin: 3,
    dim: "640 × 420",
    likes: 720,
  },
  {
    category: "Dolor",
    title: "Duis aute irure dolor in reprehenderit",
    excerpt:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.",
    date: "October 2, 2021",
    readMin: 4,
    dim: "640 × 420",
    likes: 64,
  },
  {
    category: "Amet",
    title: "Excepteur sint occaecat cupidatat non proident",
    excerpt:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    date: "September 28, 2021",
    readMin: 5,
    dim: "640 × 420",
    likes: 42,
  },
  {
    category: "Lorem",
    title: "Sed ut perspiciatis unde omnis iste natus",
    excerpt:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    date: "September 21, 2021",
    readMin: 6,
    dim: "640 × 420",
    likes: 96,
  },
  {
    category: "Ipsum",
    title: "Nemo enim ipsam voluptatem quia voluptas",
    excerpt:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
    date: "September 14, 2021",
    readMin: 3,
    dim: "640 × 420",
    likes: 33,
  },
];
