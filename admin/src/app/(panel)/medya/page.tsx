import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import MediaManager from "./MediaManager";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader
          title="Media"
          subtitle="Site bölüm görsellerini yönetin"
        />
        <SetupNotice />
      </>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.from("site_media").select("slot_key, url");

  const initial: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.url) initial[row.slot_key as string] = row.url as string;
  }

  return (
    <>
      <PageHeader
        title="Media"
        subtitle="Site bölüm görsellerini yükleyin — değişiklikler anında yayında"
      />
      <MediaManager initial={initial} />
    </>
  );
}
