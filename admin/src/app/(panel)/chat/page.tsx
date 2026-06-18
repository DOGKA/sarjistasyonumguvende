import PageHeader from "@/components/PageHeader";

export default function ChatPage() {
  return (
    <>
      <PageHeader title="Chat" subtitle="Canlı destek ve mesajlaşma" />
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
        Bu bölüm yakında kullanıma açılacak.
      </div>
    </>
  );
}
