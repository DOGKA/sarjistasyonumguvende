import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { siteUrl, SITE_URL } from "@/lib/site";
import type {
  ChargingOverride,
  ChargingPricesData,
  ChargingOperator,
} from "@/lib/types";
import PriceManager, { type OperatorView } from "./PriceManager";

export const dynamic = "force-dynamic";

/**
 * Canlı çekme başarısız olursa bile admin değer girebilsin diye bilinen
 * operatör listesi (scripts/scrape-prices.mjs ile uyumlu).
 */
const KNOWN_OPERATORS: { id: string; name: string; url: string }[] = [
  { id: "trugo", name: "Trugo", url: "https://trugo.com.tr/price" },
  { id: "zes", name: "ZES", url: "https://zes.net/tr/fiyatlandirma" },
  { id: "voltrun", name: "Voltrun", url: "https://www.voltrun.com/tr/tarifeler" },
  {
    id: "tesla",
    name: "Tesla Supercharger",
    url: "https://www.tesla.com/tr_tr/support/charging/supercharger/fees",
  },
  {
    id: "shell",
    name: "Shell Recharge",
    url: "https://www.shell.com.tr/suruculer/shell-recharge-turkiye/fiyat-tarifesi.html",
  },
  {
    id: "wat",
    name: "Wat Mobilite",
    url: "https://www.watmobilite.com/cozumler/kamusal-alanlar",
  },
];

async function fetchLivePrices(): Promise<ChargingPricesData | null> {
  try {
    const res = await fetch(siteUrl("/data/charging-prices.json"), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as ChargingPricesData;
  } catch {
    return null;
  }
}

export default async function TarifelerPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader
          title="Şarj Tarifeleri"
          subtitle="Operatör fiyatlarının çekme durumu ve değerleri"
        />
        <SetupNotice />
      </>
    );
  }

  const admin = createAdminClient();
  const [live, overridesRes] = await Promise.all([
    fetchLivePrices(),
    admin.from("charging_overrides").select("operator_id, name, tariffs, updated_at"),
  ]);

  const overrides = new Map<string, ChargingOverride>();
  for (const row of (overridesRes.data ?? []) as ChargingOverride[]) {
    overrides.set(row.operator_id, row);
  }

  // Operatör temeli: canlı JSON varsa ondan, yoksa bilinen listeden.
  const baseOperators: ChargingOperator[] = live
    ? live.operators
    : KNOWN_OPERATORS.map((o) => ({
        ...o,
        source: "manual" as const,
        tariffs: [],
      }));

  // Override'da olup temelde olmayan operatörleri de göster.
  const seen = new Set(baseOperators.map((o) => o.id));
  for (const [id, ov] of overrides) {
    if (!seen.has(id)) {
      const known = KNOWN_OPERATORS.find((k) => k.id === id);
      baseOperators.push({
        id,
        name: ov.name ?? known?.name ?? id,
        url: known?.url ?? "",
        source: "manual",
        tariffs: [],
      });
    }
  }

  const operators: OperatorView[] = baseOperators.map((op) => {
    const ov = overrides.get(op.id) ?? null;
    return {
      id: op.id,
      name: ov?.name ?? op.name,
      url: op.url,
      source: op.source,
      fetchedAt: op.fetchedAt ?? null,
      liveTariffs: op.tariffs ?? [],
      override: ov
        ? { tariffs: ov.tariffs ?? [], updatedAt: ov.updated_at }
        : null,
    };
  });

  const liveOk = !!live;
  const scrapedCount = operators.filter(
    (o) => o.source === "scraped" && !o.override
  ).length;
  const overrideCount = operators.filter((o) => o.override).length;

  return (
    <>
      <PageHeader
        title="Şarj Tarifeleri"
        subtitle="Operatör fiyatlarının çekme durumu ve değerleri"
      />

      <div className="space-y-6 p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Canlı çekme"
            value={liveOk ? "Erişildi" : "Erişilemedi"}
            tone={liveOk ? "ok" : "bad"}
            hint={
              live
                ? `Son güncelleme: ${formatDate(live.lastUpdated)}`
                : `${SITE_URL} adresine ulaşılamadı`
            }
          />
          <SummaryCard
            label="Otomatik çekilen"
            value={`${scrapedCount} operatör`}
            tone="ok"
            hint="Canlı sayfadan okundu"
          />
          <SummaryCard
            label="Elle ayarlanan"
            value={`${overrideCount} operatör`}
            tone={overrideCount ? "info" : "muted"}
            hint="Panelden girilen değerler"
          />
        </div>

        {!liveOk && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Canlı fiyat dosyasına ulaşılamadı. Aşağıdan operatör fiyatlarını elle
            girebilirsiniz; girdiğiniz değerler sitede otomatik değerlerin yerine
            kullanılır.
          </div>
        )}

        <PriceManager operators={operators} />
      </div>
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "ok" | "bad" | "info" | "muted";
}) {
  const dot =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "bad"
        ? "bg-rose-500"
        : tone === "info"
          ? "bg-sky-500"
          : "bg-slate-300";
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}
