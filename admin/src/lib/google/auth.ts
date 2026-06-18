import { JWT } from "google-auth-library";

export const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
export const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

/**
 * Servis hesabı kimlik bilgilerinden OAuth2 erişim jetonu üretir.
 * Env tanımlı değilse null döner; çağıran taraf nazikçe "kurulmadı" gösterir.
 */
export async function getAccessToken(scopes: string[]): Promise<string | null> {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) return null;

  // Vercel env'inde private key genelde tek satır + "\n" kaçışlı saklanır.
  const key = rawKey.replace(/\\n/g, "\n");

  const client = new JWT({ email, key, scopes });
  const { access_token } = await client.authorize();
  return access_token ?? null;
}
