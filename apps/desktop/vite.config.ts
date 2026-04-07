import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Configure Vite to treat the web app as the source for the desktop build.
export default defineConfig({
  root: resolve(__dirname, "../web"),
  plugins: [react()],
  // Ensure the dev server runs on a fixed port for Tauri.
  server: {
    port: 1420,
    strictPort: true,
    // Tauri expects HMR on a separate port.
    hmr: {
      protocol: "ws",
      host: process.env.TAURI_DEV_HOST || "localhost",
      port: 1421,
    },
    watch: {
      // Ignore the Tauri Rust source while watching.
      ignored: ["**/src-tauri/**"],
    },
  },
  // Forward environment variables to the web code.
  define: {
    "process.env": process.env,
  },
});
