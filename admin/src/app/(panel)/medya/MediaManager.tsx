"use client";

import { useRef, useState, useTransition } from "react";
import { IconImage, IconUpload } from "@/components/icons";
import { MEDIA_SECTIONS, type MediaSlot } from "./slots";
import { resetMedia, uploadMedia } from "./actions";

export default function MediaManager({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const [urls, setUrls] = useState<Record<string, string>>(initial);

  return (
    <div className="space-y-10 p-8">
      {MEDIA_SECTIONS.map((section) => (
        <section key={section.id}>
          <h2 className="mb-4 text-sm font-semibold tracking-tight text-[var(--muted)]">
            {section.title}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.slots.map((slot) => (
              <SlotCard
                key={slot.key}
                slot={slot}
                url={urls[slot.key]}
                onChange={(url) =>
                  setUrls((prev) => {
                    const next = { ...prev };
                    if (url) next[slot.key] = url;
                    else delete next[slot.key];
                    return next;
                  })
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SlotCard({
  slot,
  url,
  onChange,
}: {
  slot: MediaSlot;
  url?: string;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    const fd = new FormData();
    fd.set("slot_key", slot.key);
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadMedia(fd);
      if (res?.error) setError(res.error);
      else if (res?.url) onChange(res.url);
    });
  }

  function handleReset() {
    setError(null);
    startTransition(async () => {
      const res = await resetMedia(slot.key);
      if (res?.error) setError(res.error);
      else onChange(null);
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div
        className="relative w-full bg-[var(--surface-2)]"
        style={{ aspectRatio: slot.ratio }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={slot.label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-center text-[var(--muted)]">
            <div>
              <IconImage width={26} height={26} className="mx-auto" />
              <p className="mt-2 text-xs">Varsayılan görsel</p>
            </div>
          </div>
        )}
        {pending && (
          <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium text-[var(--foreground)]">
            İşleniyor…
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{slot.label}</p>
          <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
            {slot.ratioLabel}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          Önerilen: {slot.recommended}
        </p>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-3 flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#06210f] transition hover:brightness-105 disabled:opacity-60"
          >
            <IconUpload width={14} height={14} />
            Görsel yükle
          </button>
          {url && (
            <button
              type="button"
              disabled={pending}
              onClick={handleReset}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-60"
            >
              Varsayılana dön
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
