"use client";

import { useState, useTransition } from "react";
import type { ContactStatus, ContactSubmission } from "@/lib/types";
import {
  IconChevronDown,
  IconChevronUp,
  IconPaperclip,
} from "@/components/icons";
import { getContactFileUrl, updateContactStatus } from "./actions";

const STATUS_META: Record<ContactStatus, { label: string; cls: string }> = {
  new: { label: "Yeni", cls: "bg-sky-50 text-sky-700" },
  read: { label: "Okundu", cls: "bg-slate-100 text-slate-600" },
  answered: { label: "Yanıtlandı", cls: "bg-emerald-50 text-emerald-700" },
  archived: { label: "Arşiv", cls: "bg-zinc-100 text-zinc-500" },
};

const SUBJECT_FALLBACK = "—";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactList({ items }: { items: ContactSubmission[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeStatus(id: string, status: ContactStatus) {
    startTransition(() => {
      void updateContactStatus(id, status);
    });
  }

  async function openFile(path: string) {
    const res = await getContactFileUrl(path);
    if (res.url) window.open(res.url, "_blank");
    else alert(res.error ?? "Dosya açılamadı");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
            <th className="px-5 py-3 font-medium">Tarih</th>
            <th className="px-5 py-3 font-medium">Ad Soyad</th>
            <th className="px-5 py-3 font-medium">Konu</th>
            <th className="px-5 py-3 font-medium">Durum</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const open = openId === c.id;
            const meta = STATUS_META[c.status];
            return (
              <FragmentRow
                key={c.id}
                c={c}
                open={open}
                meta={meta}
                pending={pending}
                onToggle={() => setOpenId(open ? null : c.id)}
                onStatus={(s) => changeStatus(c.id, s)}
                onFile={openFile}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRow({
  c,
  open,
  meta,
  pending,
  onToggle,
  onStatus,
  onFile,
}: {
  c: ContactSubmission;
  open: boolean;
  meta: { label: string; cls: string };
  pending: boolean;
  onToggle: () => void;
  onStatus: (s: ContactStatus) => void;
  onFile: (path: string) => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer border-b border-[var(--border)] transition hover:bg-[var(--surface-2)]"
      >
        <td className="px-5 py-3 text-[var(--muted)] whitespace-nowrap">
          {formatDate(c.created_at)}
        </td>
        <td className="px-5 py-3 font-medium">{c.name}</td>
        <td className="px-5 py-3 text-[var(--muted)]">
          {c.subject || SUBJECT_FALLBACK}
        </td>
        <td className="px-5 py-3">
          <span className={`rounded-full px-2.5 py-1 text-xs ${meta.cls}`}>
            {meta.label}
          </span>
        </td>
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
          <td colSpan={5} className="px-5 py-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="E-posta" value={c.email} link={`mailto:${c.email}`} />
                  <Field
                    label="Telefon"
                    value={c.phone || "—"}
                    link={c.phone ? `tel:${c.phone}` : undefined}
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs text-[var(--muted)]">Mesaj</p>
                  <p className="whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
                    {c.message}
                  </p>
                </div>
                {c.file_url && (
                  <button
                    onClick={() => onFile(c.file_url!)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--accent-2)] transition hover:bg-[var(--surface-2)]"
                  >
                    <IconPaperclip width={16} height={16} />
                    {c.file_name || "Eki indir"}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[var(--muted)]">Durumu güncelle</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS_META) as ContactStatus[]).map((s) => (
                    <button
                      key={s}
                      disabled={pending || c.status === s}
                      onClick={() => onStatus(s)}
                      className={`rounded-lg px-3 py-1.5 text-xs transition ${
                        c.status === s
                          ? STATUS_META[s].cls
                          : "border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-2)]"
                      } disabled:opacity-60`}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
                <a
                  href={`mailto:${c.email}?subject=${encodeURIComponent(
                    "Re: " + (c.subject || "Talebiniz")
                  )}`}
                  className="mt-2 inline-block rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[#06210f]"
                >
                  E-posta ile yanıtla
                </a>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Field({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-[var(--muted)]">{label}</p>
      {link ? (
        <a href={link} className="text-sm text-[var(--accent-2)] hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}
