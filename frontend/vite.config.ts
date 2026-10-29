import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL?.trim();

  if (mode === "production") {
    if (!apiUrl) {
      throw new Error(
        "VITE_API_URL não foi configurada para o build de produção."
      );
    }

    if (
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(apiUrl)
    ) {
      throw new Error(
        "VITE_API_URL não pode apontar para localhost em produção."
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
  };
});