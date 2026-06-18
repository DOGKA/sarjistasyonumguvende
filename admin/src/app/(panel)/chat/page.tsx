import PageHeader from "@/components/PageHeader";
import { IconChat } from "@/components/icons";

const TAWK_DASHBOARD_URL = "https://dashboard.tawk.to/";

export default function ChatPage() {
  return (
    <>
      <PageHeader
        title="Chat"
        subtitle="Canlı destek (Tawk.to)"
        action={
          <a
            href={TAWK_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent,#2563eb)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <IconChat width={16} height={16} />
            Tawk.to panelini aç
          </a>
        }
      />

      <div className="space-y-6 p-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Canlı sohbet durumu</h2>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Sitede aktif
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Tawk.to widget&apos;ı sitenin tüm sayfalarına eklendi. Ziyaretçiler
            sağ alttaki sohbet balonundan size yazabilir. Mesajları görüntülemek
            ve yanıtlamak için Tawk.to panelini veya mobil uygulamasını
            kullanın.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <h2 className="text-sm font-medium">Nasıl yanıt veririm?</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--muted)]">
            <li>
              <a
                href={TAWK_DASHBOARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--accent,#2563eb)] underline-offset-2 hover:underline"
              >
                dashboard.tawk.to
              </a>{" "}
              adresinden Tawk.to hesabınıza giriş yapın
              (dogadanismanliktr@gmail.com).
            </li>
            <li>
              Telefondan yanıt vermek için <strong>Tawk.to</strong> mobil
              uygulamasını (App Store / Google Play) indirip aynı hesapla giriş
              yapın.
            </li>
            <li>
              Yeni mesaj geldiğinde uygulama bildirim gönderir; sohbeti açıp
              doğrudan yanıt verebilirsiniz.
            </li>
          </ol>
        </div>

        <div className="grid place-items-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/40 py-10 text-center">
          <div className="text-[var(--muted)]">
            <IconChat width={36} height={36} />
          </div>
          <p className="mt-3 text-sm font-medium">
            Sohbetler Tawk.to panelinde yönetilir
          </p>
          <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
            Geçmiş sohbetler, ziyaretçi takibi ve ekip yanıtları Tawk.to
            arayüzünde tutulur. İleride bu ekranda canlı sohbet özeti
            gösterilebilir.
          </p>
        </div>
      </div>
    </>
  );
}
