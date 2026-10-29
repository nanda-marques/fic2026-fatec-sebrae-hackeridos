import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "../services/authApi";
import type {
  Permissoes,
  RespostaLogin,
  UsuarioLogado,
} from "../services/authApi";

interface AuthContextValue {
  user: UsuarioLogado | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (resposta: RespostaLogin) => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  podeGerenciar: (recurso: keyof Permissoes) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);

  // No mount: usa cache do localStorage (evita flash) e revalida via me()
  useEffect(() => {
    let ativo = true;

    const cache = authApi.usuarioAtual();
    if (cache) setUser(cache);

    authApi
      .me()
      .then(({ usuario }) => {
        if (!ativo) return;
        localStorage.setItem("usuario", JSON.stringify(usuario));
        setUser(usuario);
      })
      .catch(() => {
        if (!ativo) return;
        authApi.limparSessao();
        setUser(null);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const signIn = useCallback((resposta: RespostaLogin) => {
    authApi.salvarSessao(resposta);
    setUser(resposta.usuario);
  }, []);

  const signOut = useCallback(() => {
    authApi.limparSessao();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { usuario } = await authApi.me();
      localStorage.setItem("usuario", JSON.stringify(usuario));
      setUser(usuario);
    } catch {
      signOut();
    }
  }, [signOut]);

  const podeGerenciar = useCallback(
    (recurso: keyof Permissoes) => Boolean(user?.permissoes?.[recurso]),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      signIn,
      signOut,
      refreshUser,
      podeGerenciar,
    }),
    [user, loading, signIn, signOut, refreshUser, podeGerenciar]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return ctx;
}