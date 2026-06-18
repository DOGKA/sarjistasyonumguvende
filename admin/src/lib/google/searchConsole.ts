import { getAccessToken, GSC_SCOPE } from "./auth";
import { isGscConfigured } from "./config";

export interface GscMetric {
  clicks: number;
  impressions: number;
  ctr: number; // 0..1
  position: number;
}

export interface GscQueryRow extends GscMetric {
  query: string;
}

export interface GscPageRow extends GscMetric {
  page: string;
}

export interface GscSummary {
  totals: GscMetric;
  queries: GscQueryRow[];
  pages: GscPageRow[];
}

interface GscApiRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}
interface GscApiResponse {
  rows?: GscApiRow[];
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function query(
  token: string,
  siteUrl: string,
  body: Record<string, unknown>
): Promise<GscApiRow[]> {
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    siteUrl
  )}/searchAnalytics/query`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Search Console API ${res.status}: ${detail.slice(0, 400)}`);
  }
  const data = (await res.json()) as GscApiResponse;
  return data.rows ?? [];
}

const toMetric = (r: GscApiRow): GscMetric => ({
  clicks: r.clicks ?? 0,
  impressions: r.impressions ?? 0,
  ctr: r.ctr ?? 0,
  position: r.position ?? 0,
});

/**
 * Search Console'dan aranan kelimeler, en çok tıklanan sayfalar ve
 * dönem toplamlarını çeker (son `days` gün). Kurulum yoksa null döner.
 */
export async function fetchGscSummary(days = 28): Promise<GscSummary | null> {
  if (!isGscConfigured()) return null;
  const siteUrl = process.env.GSC_SITE_URL!;
  const token = await getAccessToken([GSC_SCOPE]);
  if (!token) return null;

  // GSC verisi ~2-3 gün gecikmeli; bitişi dün, başlangıcı days gün öncesi al.
  const startDate = isoDaysAgo(days);
  const endDate = isoDaysAgo(1);
  const range = { startDate, endDate };

  const [totalRows, queryRows, pageRows] = await Promise.all([
    query(token, siteUrl, range),
    query(token, siteUrl, { ...range, dimensions: ["query"], rowLimit: 25 }),
    query(token, siteUrl, { ...range, dimensions: ["page"], rowLimit: 15 }),
  ]);

  const totals = totalRows[0]
    ? toMetric(totalRows[0])
    : { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const queries: GscQueryRow[] = queryRows.map((r) => ({
    query: r.keys?.[0] ?? "—",
    ...toMetric(r),
  }));

  const pages: GscPageRow[] = pageRows.map((r) => ({
    page: r.keys?.[0] ?? "—",
    ...toMetric(r),
  }));

  return { totals, queries, pages };
}
