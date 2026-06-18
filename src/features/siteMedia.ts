import { getSupabase } from "@/lib/supabase";

/**
 * Site görselleri — admin panelinden yönetilir.
 *
 * Sitedeki her yönetilebilir görselin `data-media="<slot_key>"` özniteliği vardır.
 * Bu modül `site_media` tablosundan slot → URL eşlemesini çeker ve eşleşen
 * <img>'lerin `src`'sini override eder. Tabloda kayıt yoksa veya Supabase
 * yapılandırılmamışsa, HTML'e gömülü varsayılan `assets/...` görseli kullanılır
 * (görsel açısından sıfır regresyon).
 */
interface MediaRow {
  slot_key: string;
  url: string | null;
}

export async function initSiteMedia(): Promise<void> {
  const slots = document.querySelectorAll<HTMLImageElement>("img[data-media]");
  if (slots.length === 0) return;

  const supabase = await getSupabase();
  if (!supabase) return; // Supabase yok → varsayılan görseller kalır

  try {
    const { data, error } = await supabase
      .from("site_media")
      .select("slot_key, url");
    if (error || !data) return;

    const map = new Map<string, string>();
    for (const row of data as MediaRow[]) {
      if (row.url) map.set(row.slot_key, row.url);
    }
    if (map.size === 0) return;

    slots.forEach((img) => {
      const key = img.dataset.media;
      const url = key ? map.get(key) : undefined;
      if (url) img.src = url;
    });
  } catch {
    // Ağ hatası → sessizce varsayılanlarla devam et
  }
}
