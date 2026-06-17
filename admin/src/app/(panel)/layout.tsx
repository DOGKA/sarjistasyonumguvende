import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Sidebar from "@/components/Sidebar";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kurulum öncesi: auth olmadan paneli göster (sayfalar kurulum uyarısı basar)
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen">
        <Sidebar email={null} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar email={user.email ?? null} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
