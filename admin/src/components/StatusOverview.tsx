import Link from "next/link";
import { siteUrl, SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  ChargingPricesData,
  ChargingOverride,
  RatesData,
} from "@/lib/types";
import MiniClocks from "@/components/MiniClocks";
import { IconClock, IconTag } from "@/components/icons";

const trFmt = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(siteUrl(path), { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function getOverrideIds(): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set();
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("charging_overrides").select("operator_id");
    return new Set(((data ?? []) as ChargingOverride[]).map((r) => r.operator_id));
  } catch {
    return new Set();
  }
}

/** Dashboard üstünde canlı durum: pariteler, saat ve operatör fiyatları. */
export default async function StatusOverview() {
  const [rates, prices, overrideIds] = await Promise.all([
    getJson<RatesData>("/data/rates.json"),
    getJson<ChargingPricesData>("/data/charging-prices.json"),
    getOverrideIds(),
  ]);

  const ratesOk = !!rates && rates.items.length > 0;
  const operators = prices?.operators ?? [];
  const scrapedCount = operators.filter(
    (o) => o.source === "scraped" && !overrideIds.has(o.id)
  ).length;
  const manualCount = operators.filter(
    (o) => o.source !== "scraped" && !overrideIds.has(o.id)
  ).length;
  const overrideCount = operators.filter((o) => overrideIds.has(o.id)).length;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ----------------------------------------------- PARİTELER & SAAT */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <IconClock width={16} height={16} className="text-[var(--accent)]" />
            Pariteler & Saat
          </h2>
          <StatusPill
            ok={ratesOk}
            okText="Çekildi"
            badText="Çekilemedi"
          />
        </div>

        {ratesOk ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {rates!.items.map((it) => (
              <div
                key={it.code}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              >
                <p className="text-[11px] text-[var(--muted)]">{it.name}</p>
                <p className="text-base font-semibold tabular-nums">
                  {trFmt.format(it.sell)} ₺
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Kur verisine ulaşılamadı ({SITE_URL}/data/rates.json).
          </p>
        )}

        <div className="mt-3">
          <MiniClocks />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[11px] text-[var(--muted)]">
            {rates ? `Son güncelleme: ${formatDate(rates.lastUpdated)}` : ""}
          </p>
          <Link
            href="/kurlar"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Tüm saatler & kurlar →
          </Link>
        </div>
      </div>

      {/* -------------------------------------------- OPERATÖR FİYATLARI */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <IconTag width={16} height={16} className="text-[var(--accent)]" />
            Operatör Fiyatları
          </h2>
          <StatusPill
            ok={!!prices}
            okText="Çekildi"
            badText="Çekilemedi"
          />
        </div>

        {operators.length > 0 ? (
          <>
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <Tally tone="ok" label="Otomatik" value={scrapedCount} />
              <Tally tone="info" label="Elle ayarlı" value={overrideCount} />
              <Tally tone="warn" label="Çekilemedi" value={manualCount} />
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {operators.map((o) => {
                const overridden = overrideIds.has(o.id);
                const cheapest = o.tariffs.reduce<number | null>(
                  (min, t) =>
                    min == null || t.pricePerKwh < min ? t.pricePerKwh : min,
                  null
                );
                return (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <Dot
                        tone={
                          overridden ? "info" : o.source === "scraped" ? "ok" : "warn"
                        }
                      />
                      {o.name}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {cheapest != null
                        ? `${trFmt.format(cheapest)} ₺/kWh`
                        : "—"}
                      {overridden
                        ? " · elle"
                        : o.source === "scraped"
                          ? " · otomatik"
                          : " · çekilemedi"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Fiyat verisine ulaşılamadı.
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[11px] text-[var(--muted)]">
            {prices ? `Son güncelleme: ${formatDate(prices.lastUpdated)}` : ""}
          </p>
          <Link
            href="/tarifeler"
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            Durum & değer gir →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  ok,
  okText,
  badText,
}: {
  ok: boolean;
  okText: string;
  badText: string;
}) {
  return ok ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {okText}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      {badText}
    </span>
  );
}

function Tally({
  tone,
  label,
  value,
}: {
  tone: "ok" | "info" | "warn";
  label: string;
  value: number;
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "info"
        ? "bg-sky-50 text-sky-700"
        : "bg-amber-50 text-amber-700";
  return (
    <span className={`rounded-full px-2.5 py-1 font-medium ${cls}`}>
      {label}: {value}
    </span>
  );
}

function Dot({ tone }: { tone: "ok" | "info" | "warn" }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "info"
        ? "bg-sky-500"
        : "bg-amber-500";
  return <span className={`h-2 w-2 rounded-full ${cls}`} />;
}
