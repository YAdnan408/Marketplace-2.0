import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All /api requests are forwarded to the FastAPI backend
      // so the React dev server never hits CORS issues during development
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Proxy uploaded images served by FastAPI's StaticFiles mount
      "/uploads": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});