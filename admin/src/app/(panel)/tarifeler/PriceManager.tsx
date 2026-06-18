"use client";

import { useState, useTransition } from "react";
import type { ChargingTariff, PriceSource, TariffType } from "@/lib/types";
import { IconRefresh } from "@/components/icons";
import { saveOverride, resetOverride } from "./actions";

export interface OperatorView {
  id: string;
  name: string;
  url: string;
  source: PriceSource;
  fetchedAt: string | null;
  liveTariffs: ChargingTariff[];
  override: { tariffs: ChargingTariff[]; updatedAt: string } | null;
}

interface DraftTariff {
  type: TariffType;
  label: string;
  price: string;
}

function toDraft(tariffs: ChargingTariff[]): DraftTariff[] {
  return tariffs.map((t) => ({
    type: t.type === "DC" ? "DC" : "AC",
    label: t.label ?? "",
    price: String(t.pricePerKwh ?? ""),
  }));
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
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

export default function PriceManager({ operators }: { operators: OperatorView[] }) {
  return (
    <div className="space-y-4">
      {operators.map((op) => (
        <OperatorCard key={op.id} op={op} />
      ))}
      {operators.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          Gösterilecek operatör bulunamadı.
        </div>
      )}
    </div>
  );
}

function OperatorCard({ op }: { op: OperatorView }) {
  const initial = op.override ? op.override.tariffs : op.liveTariffs;
  const [rows, setRows] = useState<DraftTariff[]>(
    initial.length ? toDraft(initial) : [{ type: "AC", label: "AC", price: "" }]
  );
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const hasOverride = !!op.override;

  function updateRow(i: number, patch: Partial<DraftTariff>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    setMsg(null);
  }

  function addRow() {
    setRows((prev) => [...prev, { type: "DC", label: "DC", price: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function onSave() {
    const tariffs: ChargingTariff[] = rows
      .map((r) => ({
        type: r.type,
        label: r.label.trim() || r.type,
        pricePerKwh: Number(r.price.replace(",", ".")),
      }))
      .filter((t) => Number.isFinite(t.pricePerKwh) && t.pricePerKwh > 0);

    if (!tariffs.length) {
      setMsg({ kind: "err", text: "En az bir geçerli fiyat girin." });
      return;
    }

    startTransition(async () => {
      const res = await saveOverride({ operatorId: op.id, name: op.name, tariffs });
      if (res?.error) setMsg({ kind: "err", text: res.error });
      else setMsg({ kind: "ok", text: "Kaydedildi. Sitede uygulanacak." });
    });
  }

  function onReset() {
    startTransition(async () => {
      const res = await resetOverride(op.id);
      if (res?.error) setMsg({ kind: "err", text: res.error });
      else {
        setMsg({ kind: "ok", text: "Otomatik değerlere dönüldü." });
        setRows(op.liveTariffs.length ? toDraft(op.liveTariffs) : rows);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{op.name}</h3>
            <StatusBadge op={op} />
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {op.source === "scraped"
              ? `Otomatik çekildi · ${formatDate(op.fetchedAt)}`
              : "Otomatik çekilemedi — değerleri elle girebilirsiniz"}
            {hasOverride && ` · Elle güncellendi: ${formatDate(op.override!.updatedAt)}`}
          </p>
          {op.url && (
            <a
              href={op.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-[var(--accent)] hover:underline"
            >
              Kaynak sayfa →
            </a>
          )}
        </div>

        {/* Canlı (otomatik) çekilen değerler — referans */}
        {op.liveTariffs.length > 0 && (
          <div className="text-right text-xs text-[var(--muted)]">
            <p className="mb-0.5 font-medium">Otomatik değer</p>
            {op.liveTariffs.map((t, i) => (
              <p key={i}>
                {t.label}: {t.pricePerKwh.toLocaleString("tr-TR")} ₺/kWh
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select
              value={r.type}
              onChange={(e) => updateRow(i, { type: e.target.value as TariffType })}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              aria-label="Tarife tipi"
            >
              <option value="AC">AC</option>
              <option value="DC">DC</option>
            </select>
            <input
              value={r.label}
              onChange={(e) => updateRow(i, { label: e.target.value })}
              placeholder="Etiket (örn. AC 22 kW)"
              className="min-w-[160px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-1.5">
              <input
                value={r.price}
                onChange={(e) => updateRow(i, { price: e.target.value })}
                inputMode="decimal"
                placeholder="0,00"
                className="w-28 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
              <span className="text-xs text-[var(--muted)]">₺/kWh</span>
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="rounded-lg border border-[var(--border)] px-2.5 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-rose-600"
              aria-label="Satırı sil"
            >
              Sil
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          + Tarife ekle
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
        {hasOverride && (
          <button
            type="button"
            onClick={onReset}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            <IconRefresh width={15} height={15} />
            Otomatiğe dön
          </button>
        )}
        {msg && (
          <span
            className={`text-sm ${
              msg.kind === "ok" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ op }: { op: OperatorView }) {
  if (op.override) {
    return (
      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
        Elle ayarlandı
      </span>
    );
  }
  if (op.source === "scraped") {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        Otomatik
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
      Çekilemedi
    </span>
  );
}
