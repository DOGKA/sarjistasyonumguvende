import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SetupNotice from "@/components/SetupNotice";
import EmptyState from "@/components/EmptyState";
import { IconBlog } from "@/components/icons";
import BlogList from "./BlogList";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

function NewButton() {
  return (
    <Link
      href="/blog/yeni"
      className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#06210f] transition hover:opacity-90"
    >
      + Yeni yazı
    </Link>
  );
}

export default async function BlogPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Blog" subtitle="Yazı yönetimi" />
        <SetupNotice />
      </>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });

  const items = (data ?? []) as BlogPost[];
  const published = items.filter((p) => p.status === "published").length;

  return (
    <>
      <PageHeader
        title="Blog"
        subtitle={`${items.length} yazı · ${published} yayında`}
        action={<NewButton />}
      />
      <div className="p-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<IconBlog width={36} height={36} />}
            title="Henüz yazı yok"
            hint="Sağ üstteki “Yeni yazı” ile ilk blog yazınızı oluşturun."
          />
        ) : (
          <BlogList items={items} />
        )}
      </div>
    </>
  );
}
