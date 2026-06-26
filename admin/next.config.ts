import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Bu klasörü kök kabul et (üst dizindeki Vite lockfile'ı ile karışmasın)
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // Server Action gövde limiti varsayılan 1 MB'dir; medya yükleme 5 MB'a
    // kadar görsele izin verdiği için limiti yükseltiyoruz (aksi halde büyük
    // görsel yüklemeleri sunucu tarafında 500 hatası verir).
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
