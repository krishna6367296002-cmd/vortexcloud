import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// "lucide-react" is aliased to src/lib/lucide-react.tsx (adds brand icons back on top of
// the real package, installed as "lucide-react-upstream").
// FIX: __dirname does not exist in ES modules ("type": "module"); derive it safely.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^lucide-react$/, replacement: path.resolve(__dirname, "src/lib/lucide-react.tsx") },
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  },
  server: {
    port: 3000,
    // Backend (FastAPI) is expected on :8001 — see README.
    proxy: { "/api": { target: "http://localhost:8001", changeOrigin: true } },
  },
});
