"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/types";
import { postUrl } from "@/lib/blog";
import { setPostStatus, deletePost } from "./actions";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type Filter = "all" | "published" | "draft";

export default function BlogList({ items }: { items: BlogPost[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, startTransition] = useTransition();

  const shown = items.filter((p) =>
    filter === "all" ? true : p.status === filter
  );

  function toggle(p: BlogPost) {
    startTransition(async () => {
      await setPostStatus(
        p.id,
        p.status === "published" ? "draft" : "published"
      );
      router.refresh();
    });
  }

  function remove(p: BlogPost) {
    if (!confirm(`“${p.title}” silinsin mi?`)) return;
    startTransition(async () => {
      await deletePost(p.id);
      router.refresh();
    });
  }

  const counts = {
    all: items.length,
    published: items.filter((p) => p.status === "published").length,
    draft: items.filter((p) => p.status === "draft").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(
          [
            ["all", "Tümü"],
            ["published", "Yayında"],
            ["draft", "Taslak"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              filter === id
                ? "bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {label} ({counts[id]})
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
              <th className="px-5 py-3 font-medium">Başlık</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Durum</th>
              <th className="px-5 py-3 font-medium">Güncellendi</th>
              <th className="px-5 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => {
              const isPub = p.status === "published";
              return (
                <tr
                  key={p.id}
                  className="border-b border-[var(--border)] transition hover:bg-[var(--surface-2)]"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/blog/${p.id}`}
                      className="font-medium hover:text-[var(--accent-2)]"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">/{p.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)]">
                    {p.category || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        isPub
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isPub ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)] whitespace-nowrap">
                    {formatDate(p.updated_at)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2 text-xs">
                      {isPub && (
                        <a
                          href={postUrl(p.slug)}
                          target="_blank"
                          rel="noopener"
                          className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                        >
                          Gör
                        </a>
                      )}
                      <button
                        onClick={() => toggle(p)}
                        disabled={pending}
                        className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-60"
                      >
                        {isPub ? "Taslağa al" : "Yayınla"}
                      </button>
                      <Link
                        href={`/blog/${p.id}`}
                        className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[var(--accent-2)] transition hover:bg-[var(--surface)]"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => remove(p)}
                        disabled={pending}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
