import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/material3-github-profile/" : "/",
  server: { port: 5230 },
  define: {
    "import.meta.env.VITE_AUTH_URL": JSON.stringify(process.env.VITE_AUTH_URL),
  },
}));
