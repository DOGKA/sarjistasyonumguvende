"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContactStatus } from "@/lib/types";

/** İletişim mesajının durumunu günceller. */
export async function updateContactStatus(id: string, status: ContactStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/iletisim");
  return { ok: true };
}

/** Belge eki için kısa ömürlü (60 sn) imzalı indirme linki üretir. */
export async function getContactFileUrl(path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("contact-files")
    .createSignedUrl(path, 60);
  if (error || !data) return { error: error?.message ?? "Dosya bulunamadı" };
  return { url: data.signedUrl };
}
