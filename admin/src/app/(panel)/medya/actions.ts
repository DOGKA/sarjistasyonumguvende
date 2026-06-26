"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_SLOT_KEYS } from "./slots";

const BUCKET = "site-media";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Bir slot için yeni görsel yükler ve site_media kaydını günceller. */
export async function uploadMedia(formData: FormData) {
  try {
    const slotKey = String(formData.get("slot_key") ?? "");
    const file = formData.get("file");

    if (!ALL_SLOT_KEYS.includes(slotKey)) {
      return { error: "Geçersiz görsel alanı." };
    }
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Dosya seçilmedi." };
    }
    if (!ALLOWED.includes(file.type)) {
      return { error: "Yalnızca JPG, PNG, WebP veya AVIF yükleyebilirsiniz." };
    }
    if (file.size > MAX_BYTES) {
      return { error: "Dosya boyutu en fazla 5 MB olabilir." };
    }

    // Oturum kontrolü (RLS dışı service-role ile yükleyeceğiz)
    const auth = await createClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return { error: "Oturum bulunamadı." };

    const admin = createAdminClient();

    // Eski dosyaları temizle (slot klasöründeki her şeyi sil)
    const { data: existing } = await admin.storage.from(BUCKET).list(slotKey);
    if (existing && existing.length > 0) {
      await admin.storage
        .from(BUCKET)
        .remove(existing.map((f) => `${slotKey}/${f.name}`));
    }

    const ext = EXT[file.type] ?? "jpg";
    const path = `${slotKey}/${Date.now()}.${ext}`;

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) return { error: `Yükleme hatası: ${upErr.message}` };

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    const url = pub.publicUrl;

    const { error: dbErr } = await admin
      .from("site_media")
      .upsert({ slot_key: slotKey, url }, { onConflict: "slot_key" });
    if (dbErr) return { error: `Kayıt hatası: ${dbErr.message}` };

    revalidatePath("/medya");
    return { ok: true, url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
    return { error: `Sunucu hatası: ${msg}` };
  }
}

/** Bir slotu varsayılana döndürür (override'ı kaldırır, dosyaları siler). */
export async function resetMedia(slotKey: string) {
  try {
    if (!ALL_SLOT_KEYS.includes(slotKey)) {
      return { error: "Geçersiz görsel alanı." };
    }

    const auth = await createClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return { error: "Oturum bulunamadı." };

    const admin = createAdminClient();

    const { data: existing } = await admin.storage.from(BUCKET).list(slotKey);
    if (existing && existing.length > 0) {
      await admin.storage
        .from(BUCKET)
        .remove(existing.map((f) => `${slotKey}/${f.name}`));
    }

    const { error } = await admin
      .from("site_media")
      .delete()
      .eq("slot_key", slotKey);
    if (error) return { error: `Silme hatası: ${error.message}` };

    revalidatePath("/medya");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
    return { error: `Sunucu hatası: ${msg}` };
  }
}
