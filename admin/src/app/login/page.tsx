import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="login-bg relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      {/* arka plan ışık küreleri */}
      <div className="login-orb login-orb--1" aria-hidden="true" />
      <div className="login-orb login-orb--2" aria-hidden="true" />
      <div className="login-orb login-orb--3" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dogafavicon.svg"
            alt="Doğa Danışmanlık"
            className="h-11 w-11 shrink-0 drop-shadow-[0_4px_20px_rgba(34,197,94,0.35)]"
          />
          <div className="text-left">
            <h1 className="text-xl font-semibold leading-tight text-white">
              Yönetim Paneli
            </h1>
            <p className="mt-0.5 text-sm text-white/55">Şarj İstasyonum Güvende</p>
          </div>
        </div>

        <div className="login-card rounded-3xl p-7">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          Yalnızca yetkili kullanıcılar erişebilir.
        </p>

        <p className="mt-3 text-center text-[11px] text-white/35">
          Developed by{" "}
          <a
            href="https://juststack.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white/60 underline-offset-2 transition hover:text-[#4ade80] hover:underline"
          >
            JUSTSTACK Software and Technology LLC
          </a>
        </p>
      </div>
    </main>
  );
}
