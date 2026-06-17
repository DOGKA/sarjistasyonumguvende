import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { IconBlog } from "@/components/icons";

export default function BlogPage() {
  return (
    <>
      <PageHeader title="Blog" subtitle="Yazı yönetimi" />
      <div className="p-8">
        <EmptyState
          icon={<IconBlog width={36} height={36} />}
          title="Blog yönetimi sonraki fazda"
          hint="Yazı ekleme/düzenleme ve public siteye dinamik yayın bir sonraki adımda eklenecek."
        />
      </div>
    </>
  );
}
