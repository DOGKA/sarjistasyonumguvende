import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/40 py-20 text-center">
      {icon && <div className="text-[var(--muted)]">{icon}</div>}
      <p className="mt-3 text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p>}
    </div>
  );
}
