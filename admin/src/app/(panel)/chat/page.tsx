import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { IconChat } from "@/components/icons";

export default function ChatPage() {
  return (
    <>
      <PageHeader title="Chat" subtitle="Canlı destek (Tawk.to)" />
      <div className="p-8">
        <EmptyState
          icon={<IconChat width={36} height={36} />}
          title="Canlı sohbet sonraki fazda"
          hint="Tawk.to entegrasyonu ile hem panelden hem telefondan yanıt verme bir sonraki adımda eklenecek."
        />
      </div>
    </>
  );
}
