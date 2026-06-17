import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/config";

let client: SupabaseClient | null = null;

/**
 * Public site için Supabase istemcisi (anon anahtar).
 * Ortam değişkenleri tanımlı değilse null döner — çağıran taraf
 * bu durumda eski (simülasyon) davranışına geri düşebilir.
 */
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/** Supabase yapılandırıldı mı? */
export function isSupabaseReady(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
