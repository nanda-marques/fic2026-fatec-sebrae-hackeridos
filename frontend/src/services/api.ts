import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de request: injeta token se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: normaliza mensagem de erro e trata 401
interface ErroApi {
  erro?: string;
  mensagem?: string;
  message?: string;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const dados = error.response?.data as ErroApi | string | null | undefined;
    const mensagem =
      typeof dados === "string"
        ? dados
        : dados?.erro ??
          dados?.mensagem ??
          dados?.message ??
          error.message ??
          "Erro desconhecido";

    // Opcional: se o backend retornar 401 e houver token, significa sessão expirada
    if (status === 401 && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    return Promise.reject(new Error(mensagem));
  }
);