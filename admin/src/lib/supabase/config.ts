/** Supabase ortam değişkenleri tanımlı mı? (kurulum öncesi nazik uyarı için) */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
