import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuFileText,
  LuHeart,
  LuSettings,
  LuLogOut,
  LuUsers,
} from "react-icons/lu";

import logo from "../../assets/logo_pequena.svg";
import { useAuth } from "../../contexts/AuthContext";

interface LinkItem {
  to: string;
  label: string;
  icone: React.ComponentType<{ className?: string }>;
}

const itemClass =
  "flex w-full items-center gap-3.5 rounded-lg px-4 py-3 text-[15px] font-bold text-white transition-colors";

/** Menu lateral administrativo com navegação e logout. */
export default function AdminMenu(): React.JSX.Element {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, podeGerenciar } = useAuth();

  function sair() {
    signOut();
    navigate("/admin/login");
  }

  const permissoes = user?.permissoes;

  const linksVisiveis: LinkItem[] = [
    ...(permissoes && Object.values(permissoes).some(Boolean)
      ? [
          {
            to: "/admin/dashboard",
            label: "Dashboard",
            icone: LuLayoutDashboard,
          },
        ]
      : []),

    ...(podeGerenciar("conteudo")
      ? [
          {
            to: "/admin/publicacoes",
            label: "Publicações",
            icone: LuFileText,
          },
        ]
      : []),

    ...(podeGerenciar("animais")
      ? [
          {
            to: "/admin/animais",
            label: "Animais",
            icone: LuHeart,
          },
        ]
      : []),

    {
      to: "/admin/configuracoes",
      label: "Configurações",
      icone: LuSettings,
    },

    ...(podeGerenciar("admins")
      ? [
          {
            to: "/admin/administradores",
            label: "Gerenciar administradores",
            icone: LuUsers,
          },
        ]
      : []),
  ];

  const primeiroLink = linksVisiveis[0]?.to ?? "/admin/configuracoes";

  return (
    <>
      {/* Botão hambúrguer (mobile) */}
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Abrir menu"
        className="fixed left-4 top-4 z-30 rounded-md bg-[#2174b7] px-3 py-2 text-xl text-white shadow lg:hidden"
      >
        ☰
      </button>

      {/* Fundo escuro (mobile) */}
      {aberto && (
        <div
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Menu lateral */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#2174b7] px-6 py-8 font-['Inter',Arial,sans-serif] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <NavLink
          to={primeiroLink}
          className="mb-10 flex items-center gap-2.5 text-white no-underline"
          onClick={() => setAberto(false)}
        >
          <img src={logo} alt="" className="h-12 w-[54px] object-contain" />

          <span className="flex flex-col leading-tight">
            <strong className="text-[17px] font-extrabold">
              Focinho Amigo
            </strong>
            <small className="text-xs font-semibold text-destaque">
              Painel Admin
            </small>
          </span>
        </NavLink>

        {/* Links de navegação */}
        <nav
          aria-label="Menu administrativo"
          className="flex flex-col gap-1.5"
        >
          {linksVisiveis.map(({ to, label, icone: Icone }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setAberto(false)}
              className={({ isActive }) =>
                `${itemClass} ${isActive ? "bg-white/20" : "hover:bg-white/10"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icone
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-destaque" : ""}`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}

          {/* Sair */}
          <button
            type="button"
            onClick={sair}
            className={`${itemClass} cursor-pointer hover:bg-white/10`}
          >
            <LuLogOut className="h-5 w-5 shrink-0" />
            Sair
          </button>
        </nav>
      </aside>
    </>
  );
}