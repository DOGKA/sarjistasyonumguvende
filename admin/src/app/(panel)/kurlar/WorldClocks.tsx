"use client";

import { useEffect, useState } from "react";

interface Zone {
  city: string;
  tz: string;
}

const ZONES: Zone[] = [
  { city: "İstanbul", tz: "Europe/Istanbul" },
  { city: "Londra", tz: "Europe/London" },
  { city: "Berlin", tz: "Europe/Berlin" },
  { city: "New York", tz: "America/New_York" },
  { city: "Dubai", tz: "Asia/Dubai" },
  { city: "Tokyo", tz: "Asia/Tokyo" },
];

function partsFor(tz: string, now: Date) {
  const time = new Intl.DateTimeFormat("tr-TR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  const day = new Intl.DateTimeFormat("tr-TR", {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(now);
  return { time, day };
}

export default function WorldClocks() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ZONES.map((z) => {
        const p = now ? partsFor(z.tz, now) : { time: "--:--:--", day: "—" };
        return (
          <div
            key={z.tz}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
          >
            <p className="text-sm font-medium text-[var(--muted)]">{z.city}</p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums">
              {p.time}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">{p.day}</p>
          </div>
        );
      })}
    </div>
  );
}
