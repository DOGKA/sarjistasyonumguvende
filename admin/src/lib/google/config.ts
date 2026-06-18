/** Google servis hesabı kimlik bilgileri tanımlı mı? */
export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
  );
}

/** GA4 Data API için gerekli env (servis hesabı + property id) hazır mı? */
export function isGa4Configured(): boolean {
  return isGoogleConfigured() && Boolean(process.env.GA4_PROPERTY_ID);
}

/** Search Console API için gerekli env (servis hesabı + site url) hazır mı? */
export function isGscConfigured(): boolean {
  return isGoogleConfigured() && Boolean(process.env.GSC_SITE_URL);
}
