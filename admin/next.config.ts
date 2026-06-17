import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Bu klasörü kök kabul et (üst dizindeki Vite lockfile'ı ile karışmasın)
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
