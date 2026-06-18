import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import SetupNotice from "@/components/SetupNotice";
import TrendChart, { type TrendPoint } from "@/components/TrendChart";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isGoogleConfigured } from "@/lib/google/config";
import {
  IconBell,
  IconMail,
  IconSearch,
  IconShield,
  IconTrendingUp,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const DAYS = 14;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Genel analiz ve performans" />
        <SetupNotice />
      </>
    );
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  const sinceIso = new Date(since.toISOString().slice(0, 10)).toISOString();

  const [contactsRes, newContactsRes, riskRes] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("created_at", { count: "exact" }),
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    admin.from("risk_results").select("created_at, score"),
  ]);

  const contacts = contactsRes.data ?? [];
  const contactsTotal = contactsRes.count ?? contacts.length;
  const newContacts = newContactsRes.count ?? 0;
  const risks = riskRes.data ?? [];
  const risksTotal = risks.length;
  const avgScore =
    risksTotal > 0
      ? Math.round(
          risks.reduce((s, r) => s + (r.score ?? 0), 0) / risksTotal
        )
      : 0;

  // Son 14 günlük trend
  const buckets = new Map<string, TrendPoint>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = dayKey(d);
    buckets.set(key, {
      label: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
      iletisim: 0,
      risk: 0,
    });
  }
  for (const c of contacts) {
    const key = (c.created_at as string).slice(0, 10);
    const b = buckets.get(key);
    if (b) b.iletisim += 1;
  }
  for (const r of risks) {
    const key = (r.created_at as string).slice(0, 10);
    const b = buckets.get(key);
    if (b) b.risk += 1;
  }
  const trend = Array.from(buckets.values());

  const recentContacts = contacts.filter(
    (c) => new Date(c.created_at as string) >= new Date(sinceIso)
  ).length;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const googleConnected = isGoogleConfigured();

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Genel analiz ve performans" />

      <div className="space-y-6 p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Toplam İletişim"
            value={contactsTotal}
            hint={`Son ${DAYS} günde ${recentContacts}`}
            icon={<IconMail />}
          />
          <StatCard
            label="Yeni / Okunmamış"
            value={newContacts}
            hint="Yanıt bekleyen"
            icon={<IconBell />}
          />
          <StatCard
            label="Risk Testi"
            value={risksTotal}
            hint="Tamamlanan test"
            icon={<IconShield />}
          />
          <StatCard
            label="Ortalama Skor"
            value={`${avgScore}/100`}
            hint="Tüm testlerin ortalaması"
            icon={<IconTrendingUp />}
          />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <h2 className="mb-4 text-sm font-medium text-[var(--muted)]">
            Son {DAYS} gün — günlük aktivite
          </h2>
          <TrendChart data={trend} />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">SEO / Google Analytics</h2>
            {gaId ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Etiket bağlı · {gaId}
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                Etiket bağlı değil
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {googleConnected
              ? "Aranan kelimeler, en çok ziyaret edilen sayfalar, blog performansı ve trafik kaynakları artık SEO & Analiz sayfasında."
              : "Google Search Console + GA4 Data API bağlandığında aranan kelimeler, gösterim, tıklama ve sıralama burada raporlanır. Kurulum için SEO & Analiz sayfasına gidin."}
          </p>
          <Link
            href="/seo"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--surface-2)]"
          >
            <IconSearch width={16} height={16} />
            SEO &amp; Analiz&apos;i aç
          </Link>
        </div>
      </div>
    </>
  );
}
