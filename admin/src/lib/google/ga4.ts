import { getAccessToken, GA4_SCOPE } from "./auth";
import { isGa4Configured } from "./config";

export interface NamedCount {
  name: string;
  value: number;
}

export interface PageRow {
  path: string;
  title: string;
  views: number;
}

export interface Ga4Daily {
  date: string; // YYYYMMDD
  label: string; // gg.aa
  users: number;
  sessions: number;
}

export interface Ga4Summary {
  totals: { users: number; sessions: number; views: number };
  daily: Ga4Daily[];
  topPages: PageRow[];
  topBlog: PageRow[];
  devices: NamedCount[];
  channels: NamedCount[];
}

interface GaReportRow {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}
interface GaReport {
  rows?: GaReportRow[];
}
interface BatchResponse {
  reports?: GaReport[];
}

const num = (v?: string) => Number(v ?? 0) || 0;

function dayLabel(yyyymmdd: string): string {
  // 20260618 -> 18.06
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(6, 8)}.${yyyymmdd.slice(4, 6)}`;
}

/**
 * GA4 Data API'den (batchRunReports — tek HTTP çağrısı) özet veri çeker.
 * Kurulum yoksa null döner. Hata olursa Error fırlatır (sayfa yakalar).
 */
export async function fetchGa4Summary(days = 28): Promise<Ga4Summary | null> {
  if (!isGa4Configured()) return null;
  const propertyId = process.env.GA4_PROPERTY_ID!;
  const token = await getAccessToken([GA4_SCOPE]);
  if (!token) return null;

  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }];

  const body = {
    requests: [
      // 0) Günlük trend (kullanıcı + oturum)
      {
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 365,
      },
      // 1) En çok görüntülenen sayfalar (başlık + yol)
      {
        dateRanges,
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [
          { metric: { metricName: "screenPageViews" }, desc: true },
        ],
        limit: 50,
      },
      // 2) Cihaz kategorisi
      {
        dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      },
      // 3) Trafik kaynağı (kanal grubu)
      {
        dateRanges,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      },
      // 4) Dönem toplamları (tekil kullanıcı için boyutsuz sorgu)
      {
        dateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
      },
    ],
  };

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GA4 API ${res.status}: ${detail.slice(0, 400)}`);
  }

  const data = (await res.json()) as BatchResponse;
  const reports = data.reports ?? [];

  const dailyRows = reports[0]?.rows ?? [];
  const daily: Ga4Daily[] = dailyRows.map((r) => {
    const date = r.dimensionValues?.[0]?.value ?? "";
    return {
      date,
      label: dayLabel(date),
      users: num(r.metricValues?.[0]?.value),
      sessions: num(r.metricValues?.[1]?.value),
    };
  });

  const pageRows = reports[1]?.rows ?? [];
  const allPages: PageRow[] = pageRows.map((r) => ({
    path: r.dimensionValues?.[0]?.value ?? "",
    title: r.dimensionValues?.[1]?.value ?? "",
    views: num(r.metricValues?.[0]?.value),
  }));

  const isBlog = (p: PageRow) =>
    p.path.includes("/blog") || p.path.includes("blog.html");
  const topBlog = allPages.filter(isBlog).slice(0, 10);
  const topPages = allPages.slice(0, 10);

  const devices: NamedCount[] = (reports[2]?.rows ?? []).map((r) => ({
    name: r.dimensionValues?.[0]?.value ?? "—",
    value: num(r.metricValues?.[0]?.value),
  }));

  const channels: NamedCount[] = (reports[3]?.rows ?? []).map((r) => ({
    name: r.dimensionValues?.[0]?.value ?? "—",
    value: num(r.metricValues?.[0]?.value),
  }));

  const totalRow = reports[4]?.rows?.[0];
  const totals = {
    users: num(totalRow?.metricValues?.[0]?.value),
    sessions: num(totalRow?.metricValues?.[1]?.value),
    views: num(totalRow?.metricValues?.[2]?.value),
  };

  return { totals, daily, topPages, topBlog, devices, channels };
}
