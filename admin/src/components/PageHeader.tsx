export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-8 py-5">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
