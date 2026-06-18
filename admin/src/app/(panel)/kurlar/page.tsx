import PageHeader from "@/components/PageHeader";
import { siteUrl, SITE_URL } from "@/lib/site";
import type { RatesData } from "@/lib/types";
import WorldClocks from "./WorldClocks";

export const dynamic = "force-dynamic";

async function fetchRates(): Promise<RatesData | null> {
  try {
    const res = await fetch(siteUrl("/data/rates.json"), { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as RatesData;
  } catch {
    return null;
  }
}

const trFmt = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "—";
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function KurlarPage() {
  const rates = await fetchRates();
  const ok = !!rates && rates.items.length > 0;

  return (
    <>
      <PageHeader
        title="Kur & Saat"
        subtitle="Döviz/altın çekme durumu ve dünya saatleri"
      />

      <div className="space-y-8 p-8">
        {/* ---------------------------------------------------- DÖVİZ DURUMU */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-[var(--muted)]">
              Döviz & Altın Kurları
            </h2>
            {ok ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Çekildi
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Çekilemedi
              </span>
            )}
          </div>

          {ok ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {rates!.items.map((it) => (
                  <div
                    key={it.code}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
                  >
                    <p className="text-xs font-medium text-[var(--muted)]">
                      {it.name}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">
                      {trFmt.format(it.sell)}{" "}
                      <span className="text-sm font-normal text-[var(--muted)]">
                        ₺
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {it.buy != null
                        ? `Alış ${trFmt.format(it.buy)} · Satış ${trFmt.format(it.sell)}`
                        : "Satış değeri"}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--muted)]">
                Kaynak: {rates!.source}
                {rates!.date ? ` · TCMB tarihi: ${rates!.date}` : ""} · Son
                güncelleme: {formatDate(rates!.lastUpdated)}
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Kur verisine ulaşılamadı ({SITE_URL}/data/rates.json). Çekme
              işleminin (<code>npm run fetch:rates</code>) çalıştığından ve
              dosyanın yayınlandığından emin olun.
            </div>
          )}
        </section>

        {/* ----------------------------------------------------- DÜNYA SAATLERİ */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-[var(--muted)]">
            Dünya Saatleri
          </h2>
          <WorldClocks />
        </section>
      </div>
    </>
  );
}
