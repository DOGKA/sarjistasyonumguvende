import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import EmptyState from "@/components/EmptyState";
import { IconShield } from "@/components/icons";
import RiskList from "./RiskList";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { RiskResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RiskPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Risk Testleri" subtitle="Test sonuçları ve cevaplar" />
        <SetupNotice />
      </>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("risk_results")
    .select("*")
    .order("created_at", { ascending: false });

  const items = (data ?? []) as RiskResult[];

  return (
    <>
      <PageHeader title="Risk Testleri" subtitle={`${items.length} sonuç`} />
      <div className="p-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<IconShield width={36} height={36} />}
            title="Henüz test sonucu yok"
            hint="Risk testini tamamlayan kullanıcılar burada görünür."
          />
        ) : (
          <RiskList items={items} />
        )}
      </div>
    </>
  );
}
