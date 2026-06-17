import { qsa, qsOpt } from "@/lib/dom";

/** Paylaşılacak yazının verileri (share-root data-* özniteliklerinden okunur). */
interface SharePost {
  title: string;
  url: string;
}

/** Kısa bilgilendirme balonu gösterir. */
function toast(message: string): void {
  const el = document.createElement("div");
  el.className = "share-toast";
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-on"));
  window.setTimeout(() => {
    el.classList.remove("is-on");
    window.setTimeout(() => el.remove(), 300);
  }, 2600);
}

/** Bağlantıyı panoya kopyalamayı dener. */
async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * WhatsApp paylaşımı: yazının bağlantısını paylaşır.
 * WhatsApp, bağlantıyı açıp sayfanın og:image etiketinden önizleme kartını
 * (blogda kullanılan görselle) otomatik oluşturur.
 */
function shareWhatsApp(post: SharePost): void {
  const text = encodeURIComponent(`${post.title}\n${post.url}`);
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
}

/**
 * Instagram paylaşımı: Instagram web'de bağlantı paylaşımını desteklemediğinden
 * mobilde yerel paylaşım menüsü açılır (DM/Story), masaüstünde bağlantı kopyalanır.
 */
async function shareInstagram(post: SharePost): Promise<void> {
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
  const data: ShareData = { title: post.title, text: post.title, url: post.url };
  if (typeof nav.share === "function" && (!nav.canShare || nav.canShare(data))) {
    try {
      await nav.share(data);
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }
  const copied = await copyLink(post.url);
  toast(
    copied
      ? "Bağlantı kopyalandı. Instagram gönderinde/hikayende paylaşabilirsin."
      : "Bağlantıyı kopyalayıp Instagram'da paylaşabilirsin."
  );
}

/** Blog detay sayfasındaki paylaşım butonlarını bağlar. */
export function initBlogShare(): void {
  const root = qsOpt<HTMLElement>("[data-share-root]");
  if (!root) return;

  const post: SharePost = {
    title: root.dataset.title ?? document.title,
    url: window.location.href,
  };

  for (const btn of qsa<HTMLButtonElement>("[data-share]", root)) {
    btn.addEventListener("click", () => {
      const target = btn.dataset.share;
      if (target === "whatsapp") shareWhatsApp(post);
      else if (target === "instagram") void shareInstagram(post);
    });
  }
}
