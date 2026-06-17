import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import EmptyState from "@/components/EmptyState";
import { IconMail } from "@/components/icons";
import ContactList from "./ContactList";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ContactSubmission } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function IletisimPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="İletişim" subtitle="Form üzerinden gelen mesajlar" />
        <SetupNotice />
      </>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const items = (data ?? []) as ContactSubmission[];

  return (
    <>
      <PageHeader
        title="İletişim"
        subtitle={`${items.length} mesaj`}
      />
      <div className="p-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<IconMail width={36} height={36} />}
            title="Henüz mesaj yok"
            hint="İletişim formundan gelen talepler burada listelenir."
          />
        ) : (
          <ContactList items={items} />
        )}
      </div>
    </>
  );
}
