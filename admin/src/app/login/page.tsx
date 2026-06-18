import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dogalogo-green.svg"
            alt="Doğa Danışmanlık"
            className="mx-auto mb-5 h-12 w-auto"
          />
          <h1 className="text-xl font-semibold">Yönetim Paneli</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Şarj İstasyonum Güvende
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
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
