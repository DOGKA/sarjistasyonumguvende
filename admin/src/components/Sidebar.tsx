"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  IconBolt,
  IconBlog,
  IconChat,
  IconClock,
  IconDashboard,
  IconImage,
  IconLogout,
  IconMail,
  IconSearch,
  IconShield,
  IconTag,
} from "@/components/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  href: string;
  label: string;
  Icon: IconType;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/seo", label: "SEO & Analiz", Icon: IconSearch },
  { href: "/blog", label: "Blog", Icon: IconBlog },
  { href: "/medya", label: "Media", Icon: IconImage },
  { href: "/tarifeler", label: "Şarj Tarifeleri", Icon: IconTag },
  { href: "/kurlar", label: "Kur & Saat", Icon: IconClock },
  { href: "/iletisim", label: "İletişim", Icon: IconMail },
  { href: "/risk-testleri", label: "Risk Testleri", Icon: IconShield },
  { href: "/chat", label: "Chat", Icon: IconChat },
];

export default function Sidebar({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
          <IconBolt width={18} height={18} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Yönetim Paneli</p>
          <p className="text-[11px] text-[var(--muted)]">Şarj İstasyonum</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-[var(--accent)]/15 text-[var(--foreground)] font-medium"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon
                width={18}
                height={18}
                className={active ? "text-[var(--accent)]" : ""}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="mb-2 px-2 text-xs text-[var(--muted)] truncate">
          {email ?? "—"}
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          >
            <IconLogout width={16} height={16} />
            Çıkış Yap
          </button>
        </form>
      </div>
    </aside>
  );
}
