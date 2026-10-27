import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import type { JSX } from "react";

import PublicMenu from "./components/layout/PublicMenu";
import PublicFooter from "./components/layout/PublicFooter";
import AdminMenu from "./components/layout/AdminMenu";
import { authApi } from "./services/authApi";
import type { Permissoes } from "./services/authApi";

import Home from "./pages/public/Home/Home";
import About from "./pages/public/About/About";
import Adoption from "./pages/public/Adoption/Adoption";
import Sponsorship from "./pages/public/Sponsorship/Sponsorship";
import Volunteer from "./pages/public/Volunteer/Volunteer";
import Help from "./pages/public/Help/Help";
import Contact from "./pages/public/Contact/Contact";
import CampaignsNews from "./pages/public/CampaignsNews/CampaignsNews";
import CampaignDetail from "./pages/public/CampaignDetail/CampaignDetail";

import Login from "./pages/admin/Login/Login";
import Register from "./pages/admin/Register/Register";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Animals from "./pages/admin/Animals/Animals";
import Publications from "./pages/admin/Publications/Publications";
import PublicationEditor from "./pages/admin/Publications/PublicationEditor";
import PublicationPreview from "./pages/admin/Publications/PublicationPreview";
import Settings from "./pages/admin/Settings/Settings";
import RecuperarSenha from "./pages/admin/RecuperarSenha/Senha";
import Administradores from "./pages/admin/Administradores/Administradores";

function PublicLayout(): JSX.Element {
  return (
    <>
      <PublicMenu />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </>
  );
}

function ProtectedRoute(): JSX.Element {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

function PermissionRoute({
  permissao,
}: {
  permissao: keyof Permissoes;
}): JSX.Element {
  if (!authApi.podeGerenciar(permissao)) {
    return <Navigate to="/admin/configuracoes" replace />;
  }

  return <Outlet />;
}

function DashboardPermissionRoute(): JSX.Element {
  const permissoes = authApi.usuarioAtual()?.permissoes;
  const temPermissao = permissoes
    ? Object.values(permissoes).some(Boolean)
    : false;

  if (!temPermissao) {
    return <Navigate to="/admin/configuracoes" replace />;
  }

  return <Outlet />;
}

function AdminLayout(): JSX.Element {
  return (
    <div className="admin-area flex min-h-screen bg-[#f0f0f0]">
      <AdminMenu />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sobre-nos" element={<About />} />
          <Route path="/adocao" element={<Adoption />} />
          <Route path="/apadrinhamento" element={<Sponsorship />} />
          <Route path="/voluntariado" element={<Volunteer />} />
          <Route path="/como-ajudar" element={<Help />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/campanhas-e-noticias" element={<CampaignsNews />} />
          <Route
            path="/campanhas-e-noticias/:id"
            element={<CampaignDetail />}
          />
        </Route>

        {/* Acesso e recuperação de conta */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/cadastro" element={<Register />} />
        <Route
          path="/admin/recuperar-senha"
          element={<RecuperarSenha />}
        />

        {/* Área administrativa autenticada */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Dashboard: usuários com ao menos uma permissão */}
            <Route element={<DashboardPermissionRoute />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
            </Route>

            {/* Gerenciamento de animais */}
            <Route element={<PermissionRoute permissao="animais" />}>
              <Route path="/admin/animais" element={<Animals />} />
            </Route>

            {/* Gerenciamento de publicações */}
            <Route element={<PermissionRoute permissao="conteudo" />}>
              <Route
                path="/admin/publicacoes"
                element={<Publications />}
              />
              <Route
                path="/admin/publicacoes/nova"
                element={<PublicationEditor />}
              />
              <Route
                path="/admin/publicacoes/:id/editar"
                element={<PublicationEditor />}
              />
              <Route
                path="/admin/publicacoes/:id/preview"
                element={<PublicationPreview />}
              />
            </Route>

            {/* Configurações pessoais */}
            <Route
              path="/admin/configuracoes"
              element={<Settings />}
            />

            {/* Gerenciamento e aprovação de administradores */}
            <Route element={<PermissionRoute permissao="admins" />}>
              <Route
                path="/admin/administradores"
                element={<Administradores />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;