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
    strictPort: true,
  },
  preview: {
    port: 8000,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    target: "es2020",
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        compare: fileURLToPath(new URL("./karsilastir.html", import.meta.url)),
        blog: fileURLToPath(new URL("./blog.html", import.meta.url)),
        calculator: fileURLToPath(new URL("./hesaplayici.html", import.meta.url)),
        contact: fileURLToPath(new URL("./iletisim.html", import.meta.url)),
      },
    },
  },
});
