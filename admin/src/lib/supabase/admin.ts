import { createClient } from "@supabase/supabase-js";

/**
 * Service-role istemcisi — RLS'yi atlar, TÜM veriye erişir.
 * SADECE sunucu tarafında (route handler / server action) kullanın.
 * service_role anahtarı asla tarayıcıya gönderilmemelidir.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Sunucu yapılandırması eksik: NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ortam değişkenleri tanımlı olmalı."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
