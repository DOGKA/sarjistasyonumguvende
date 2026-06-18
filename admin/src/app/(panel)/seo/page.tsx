import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import TrafficChart from "./TrafficChart";
import {
  IconBolt,
  IconSearch,
  IconTrendingUp,
  IconBlog,
} from "@/components/icons";
import { isGoogleConfigured, isGa4Configured, isGscConfigured } from "@/lib/google/config";
import { fetchGa4Summary, type Ga4Summary, type NamedCount } from "@/lib/google/ga4";
import { fetchGscSummary, type GscSummary } from "@/lib/google/searchConsole";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DAYS = 28;

const nf = new Intl.NumberFormat("tr-TR");
const fmt = (n: number) => nf.format(Math.round(n));
const pct = (ctr: number) => `%${(ctr * 100).toFixed(1)}`;
const pos = (p: number) => p.toFixed(1);

function shortPath(url: string): string {
  try {
    const u = new URL(url);
    return (u.pathname + u.search) || "/";
  } catch {
    return url;
  }
}

const DEVICE_TR: Record<string, string> = {
  desktop: "Masaüstü",
  mobile: "Mobil",
  tablet: "Tablet",
};

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function BarList({ items }: { items: NamedCount[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0)
    return <p className="text-sm text-[var(--muted)]">Veri yok.</p>;
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.name}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>{DEVICE_TR[it.name] ?? it.name}</span>
            <span className="text-[var(--muted)]">{fmt(it.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function GoogleSetupNotice() {
  return (
    <div className="m-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-base font-semibold text-amber-700">
        Google entegrasyonu henüz yapılandırılmadı
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Aranan kelimeler ve ziyaretçi analizini görmek için bir Google servis
        hesabı oluşturup admin projesine{" "}
        <code>GOOGLE_CLIENT_EMAIL</code>, <code>GOOGLE_PRIVATE_KEY</code>,{" "}
        <code>GA4_PROPERTY_ID</code> ve <code>GSC_SITE_URL</code> ortam
        değişkenlerini ekleyin. Adım adım kurulum için depodaki{" "}
        <code>admin/KURULUM.md</code> dosyasındaki “SEO & Analiz” bölümüne bakın.
      </p>
    </div>
  );
}

async function safe<T>(fn: () => Promise<T | null>): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await fn(), error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Bilinmeyen hata" };
  }
}

export default async function SeoPage() {
  if (!isGoogleConfigured()) {
    return (
      <>
        <PageHeader title="SEO & Analiz" subtitle="Google Search Console + GA4" />
        <GoogleSetupNotice />
      </>
    );
  }

  const [ga4r, gscr] = await Promise.all([
    safe<Ga4Summary>(() => fetchGa4Summary(DAYS)),
    safe<GscSummary>(() => fetchGscSummary(DAYS)),
  ]);
  const ga4 = ga4r.data;
  const gsc = gscr.data;

  return (
    <>
      <PageHeader
        title="SEO & Analiz"
        subtitle={`Son ${DAYS} gün · Google Search Console + GA4`}
      />

      <div className="space-y-6 p-8">
        {/* Hata uyarıları */}
        {gscr.error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Search Console verisi alınamadı: {gscr.error}
          </p>
        )}
        {ga4r.error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            GA4 verisi alınamadı: {ga4r.error}
          </p>
        )}

        {/* ---- ARAMA PERFORMANSI (Search Console) ---- */}
        {isGscConfigured() && gsc && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Tıklama" value={fmt(gsc.totals.clicks)} hint="Organik arama" icon={<IconSearch />} />
              <StatCard label="Gösterim" value={fmt(gsc.totals.impressions)} hint="Arama sonuçlarında" icon={<IconTrendingUp />} />
              <StatCard label="CTR" value={pct(gsc.totals.ctr)} hint="Tıklama oranı" icon={<IconBolt />} />
              <StatCard label="Ort. Sıralama" value={pos(gsc.totals.position)} hint="Google'da ortalama konum" icon={<IconTrendingUp />} />
            </div>

            <Card title="Aranan kelimeler" hint="En çok gösterim alan sorgular">
              {gsc.queries.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Henüz arama verisi yok.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                        <th className="py-2 pr-3 font-medium">Kelime</th>
                        <th className="py-2 px-3 font-medium text-right">Tıklama</th>
                        <th className="py-2 px-3 font-medium text-right">Gösterim</th>
                        <th className="py-2 px-3 font-medium text-right">CTR</th>
                        <th className="py-2 pl-3 font-medium text-right">Sıra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gsc.queries.map((q) => (
                        <tr key={q.query} className="border-b border-[var(--border)]/60">
                          <td className="py-2 pr-3">{q.query}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{fmt(q.clicks)}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{fmt(q.impressions)}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{pct(q.ctr)}</td>
                          <td className="py-2 pl-3 text-right tabular-nums">{pos(q.position)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card title="En çok tıklanan sayfalar" hint="Organik aramadan gelen">
              {gsc.pages.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Veri yok.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                        <th className="py-2 pr-3 font-medium">Sayfa</th>
                        <th className="py-2 px-3 font-medium text-right">Tıklama</th>
                        <th className="py-2 px-3 font-medium text-right">Gösterim</th>
                        <th className="py-2 pl-3 font-medium text-right">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gsc.pages.map((p) => (
                        <tr key={p.page} className="border-b border-[var(--border)]/60">
                          <td className="py-2 pr-3 max-w-[360px] truncate" title={p.page}>{shortPath(p.page)}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{fmt(p.clicks)}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{fmt(p.impressions)}</td>
                          <td className="py-2 pl-3 text-right tabular-nums">{pct(p.ctr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {!isGscConfigured() && (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Search Console bağlı değil — aranan kelimeler için{" "}
            <code>GSC_SITE_URL</code> ekleyin.
          </p>
        )}

        {/* ---- ZİYARETÇİ ANALİZİ (GA4) ---- */}
        {isGa4Configured() && ga4 && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Kullanıcı" value={fmt(ga4.totals.users)} hint={`Son ${DAYS} gün`} icon={<IconTrendingUp />} />
              <StatCard label="Oturum" value={fmt(ga4.totals.sessions)} hint="Ziyaret sayısı" icon={<IconBolt />} />
              <StatCard label="Sayfa Görüntüleme" value={fmt(ga4.totals.views)} hint="Toplam görüntüleme" icon={<IconSearch />} />
            </div>

            <Card title={`Günlük trafik · son ${DAYS} gün`}>
              <TrafficChart data={ga4.daily.map((d) => ({ label: d.label, users: d.users, sessions: d.sessions }))} />
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="En çok ziyaret edilen sayfalar" hint="Tüm trafik (GA4)">
                {ga4.topPages.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Veri yok.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {ga4.topPages.map((p) => (
                      <li key={p.path} className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate" title={p.title || p.path}>
                          {p.title || shortPath(p.path)}
                        </span>
                        <span className="shrink-0 tabular-nums text-[var(--muted)]">{fmt(p.views)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="Blog performansı" hint="En çok okunan yazılar">
                {ga4.topBlog.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <IconBlog width={16} height={16} /> Henüz blog görüntüleme verisi yok.
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {ga4.topBlog.map((p) => (
                      <li key={p.path} className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate" title={p.title || p.path}>
                          {p.title || shortPath(p.path)}
                        </span>
                        <span className="shrink-0 tabular-nums text-[var(--muted)]">{fmt(p.views)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="Cihaz dağılımı">
                <BarList items={ga4.devices} />
              </Card>

              <Card title="Trafik kaynağı" hint="Kanal grubu">
                <BarList items={ga4.channels} />
              </Card>
            </div>
          </>
        )}

        {!isGa4Configured() && (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            GA4 bağlı değil — ziyaretçi analizi için <code>GA4_PROPERTY_ID</code>{" "}
            ekleyin.
          </p>
        )}
      </div>
    </>
  );
}
