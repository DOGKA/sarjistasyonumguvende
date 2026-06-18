import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/config";

let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Public site için Supabase istemcisi (anon anahtar).
 *
 * `@supabase/supabase-js` paketi yalnızca ilk çağrıda dinamik olarak
 * yüklenir; böylece ana sayfa ilk yükünde ~170 KB JS taşınmaz.
 * Ortam değişkenleri tanımlı değilse Promise<null> döner — çağıran taraf
 * bu durumda eski (simülasyon) davranışına geri düşebilir.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      }),
    );
  }
  return clientPromise;
}

/** Supabase yapılandırıldı mı? */
export function isSupabaseReady(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
