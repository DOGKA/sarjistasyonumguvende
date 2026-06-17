import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">{label}</span>
        {icon && <span className="text-[var(--muted)]">{icon}</span>}
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div>}
    </div>
  );
}
