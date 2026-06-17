import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yönetim Paneli — Şarj İstasyonum Güvende",
  description: "Admin paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
