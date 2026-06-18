import { notFound } from "next/navigation";
import SetupNotice from "@/components/SetupNotice";
import PageHeader from "@/components/PageHeader";
import BlogEditor from "../BlogEditor";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { BlogPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Yazıyı düzenle" subtitle="Blog" />
        <SetupNotice />
      </>
    );
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return <BlogEditor post={data as BlogPost} />;
}
