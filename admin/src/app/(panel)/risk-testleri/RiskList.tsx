"use client";

import { useState } from "react";
import type { RiskResult } from "@/lib/types";
import {
  IconChevronDown,
  IconChevronUp,
  IconDownload,
} from "@/components/icons";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function toCsv(items: RiskResult[]): string {
  const head = ["Tarih", "Ad Soyad", "E-posta", "Skor", "Sonuç"];
  const rows = items.map((r) => [
    formatDate(r.created_at),
    r.name ?? "",
    r.email ?? "",
    String(r.score),
    r.tier_label ?? "",
  ]);
  return [head, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export default function RiskList({ items }: { items: RiskResult[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  function exportCsv() {
    const blob = new Blob(["\uFEFF" + toCsv(items)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `risk-testleri-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
        >
          <IconDownload width={16} height={16} />
          CSV indir
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
              <th className="px-5 py-3 font-medium">Tarih</th>
              <th className="px-5 py-3 font-medium">Ad Soyad</th>
              <th className="px-5 py-3 font-medium">E-posta</th>
              <th className="px-5 py-3 font-medium">Skor</th>
              <th className="px-5 py-3 font-medium">Sonuç</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const open = openId === r.id;
              return (
                <RiskRow
                  key={r.id}
                  r={r}
                  open={open}
                  onToggle={() => setOpenId(open ? null : r.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskRow({
  r,
  open,
  onToggle,
}: {
  r: RiskResult;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer border-b border-[var(--border)] transition hover:bg-[var(--surface-2)]"
      >
        <td className="px-5 py-3 text-[var(--muted)] whitespace-nowrap">
          {formatDate(r.created_at)}
        </td>
        <td className="px-5 py-3 font-medium">{r.name || "—"}</td>
        <td className="px-5 py-3 text-[var(--accent-2)]">{r.email || "—"}</td>
        <td className={`px-5 py-3 font-semibold ${scoreColor(r.score)}`}>
          {r.score}/100
        </td>
        <td className="px-5 py-3 text-[var(--muted)]">{r.tier_label || "—"}</td>
        <td className="px-5 py-3 text-right text-[var(--muted)]">
          <span className="inline-flex justify-end">
            {open ? (
              <IconChevronUp width={16} height={16} />
            ) : (
              <IconChevronDown width={16} height={16} />
            )}
          </span>
        </td>
      </tr>

      {open && (
        <tr className="border-b border-[var(--border)] bg-[var(--background)]">
          <td colSpan={6} className="px-5 py-5">
            {r.email && (
              <a
                href={`mailto:${r.email}?subject=${encodeURIComponent(
                  "Risk değerlendirmeniz hakkında"
                )}`}
                className="mb-4 inline-block rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[#06210f]"
              >
                E-posta ile dönüş yap
              </a>
            )}

            {Array.isArray(r.answers) && r.answers.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-[var(--muted)]">
                  Cevap dökümü ({r.answers.length} soru)
                </p>
                <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                  {r.answers.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 px-4 py-2.5"
                    >
                      <div className="min-w-0">
                        {a.section && (
                          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
                            {a.section}
                          </p>
                        )}
                        <p
                          className="text-sm"
                          dangerouslySetInnerHTML={{ __html: a.question }}
                        />
                        <p className="mt-0.5 text-sm text-[var(--accent-2)]">
                          → {a.answer}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--muted)]">
                        {a.points} puan
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Cevap dökümü kaydedilmemiş.
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
