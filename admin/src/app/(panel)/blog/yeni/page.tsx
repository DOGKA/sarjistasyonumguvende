import SetupNotice from "@/components/SetupNotice";
import PageHeader from "@/components/PageHeader";
import BlogEditor from "../BlogEditor";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default function NewBlogPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Yeni yazı" subtitle="Blog" />
        <SetupNotice />
      </>
    );
  }
  return <BlogEditor />;
}
