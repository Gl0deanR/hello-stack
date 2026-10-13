import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Dev server binds to 0.0.0.0 so it is reachable from outside the container.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: { usePolling: true }, // reliable hot reload inside Docker on macOS
  },
});
