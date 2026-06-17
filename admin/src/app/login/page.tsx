import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { IconBolt } from "@/components/icons";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
            <IconBolt width={24} height={24} />
          </div>
          <h1 className="text-xl font-semibold">Yönetim Paneli</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Şarj İstasyonum Güvende
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Yalnızca yetkili kullanıcılar erişebilir.
        </p>
      </div>
    </main>
  );
}
