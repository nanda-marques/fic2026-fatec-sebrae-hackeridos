const apiUrl = import.meta.env.VITE_API_URL?.trim();

if (import.meta.env.PROD && !apiUrl) {
  throw new Error(
    "VITE_API_URL não foi configurada para o build de produção."
  );
}

if (
  import.meta.env.PROD &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(apiUrl ?? "")
) {
  throw new Error(
    "VITE_API_URL não pode apontar para localhost em produção."
  );
}

export const API_URL =
  apiUrl || "http://localhost:3000";