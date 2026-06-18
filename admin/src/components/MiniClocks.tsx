"use client";

import { useEffect, useState } from "react";

const ZONES: { city: string; tz: string }[] = [
  { city: "İstanbul", tz: "Europe/Istanbul" },
  { city: "Londra", tz: "Europe/London" },
  { city: "New York", tz: "America/New_York" },
  { city: "Tokyo", tz: "Asia/Tokyo" },
];

function timeIn(tz: string, now: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
}

export default function MiniClocks() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ZONES.map((z) => (
        <div
          key={z.tz}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
        >
          <p className="text-[11px] text-[var(--muted)]">{z.city}</p>
          <p className="font-mono text-base font-semibold tabular-nums">
            {now ? timeIn(z.tz, now) : "--:--:--"}
          </p>
        </div>
      ))}
    </div>
  );
}
