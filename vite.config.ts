import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 8000,
    host: true,
  },
  preview: {
    port: 8000,
    host: true,
  },
  build: {
    outDir: "dist",
    target: "es2020",
  },
});
