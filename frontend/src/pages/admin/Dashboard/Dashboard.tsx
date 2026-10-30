import { useCallback, useEffect, useState } from "react";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiEye,
  FiEdit,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  LuFileText,
  LuMegaphone,
  LuCalendar,
  LuHeart,
  LuPawPrint,
} from "react-icons/lu";

import AdminHeader from "../../../components/layout/adminHeader";
import { publicacoesApi } from "../../../services/publicacoesApi";
import type {
  Publicacao,
  CategoriaConteudo,
  ResumoDashboard,
  StatusPublicacao,
} from "../../../services/publicacoesApi";

import { useAuth } from "../../../contexts/AuthContext";

const cardClass =
  "bg-white border border-[#e2e2e2] rounded-[12px] shadow-[0_2px_3px_rgb(0_0_0/22%)]";

const CATEGORIAS: {
  valor: CategoriaConteudo;
  nome: string;
  cor: string;
}[] = [
  { valor: "campanha", nome: "Campanhas", cor: "#2174b7" },
  { valor: "noticia", nome: "Notícias", cor: "#4285f4" },
  { valor: "evento", nome: "Eventos", cor: "#00a878" },
  { valor: "publicacao", nome: "Publicações", cor: "#8657e8" },
];

const NOME_CATEGORIA: Record<CategoriaConteudo, string> = {
  campanha: "Campanhas",
  noticia: "Notícias",
  evento: "Eventos",
  publicacao: "Publicações",
};

const NOME_STATUS: Record<StatusPublicacao, string> = {
  publicado: "Publicado",
  agendado: "Agendado",
  rascunho: "Rascunho",
  arquivado: "Arquivado",
};

const CLASSE_STATUS: Record<StatusPublicacao, string> = {
  publicado: "bg-[#e3f8ef] text-[#10b981]",
  agendado: "bg-[#e5eefd] text-[#3b82f6]",
  rascunho: "bg-[#ebeef2] text-[#667b9b]",
  arquivado: "bg-[#ebeef2] text-[#667b9b]",
};

/* ------------------------- Helpers ------------------------- */

function extrairDataISO(bruta: string | null): string {
  if (!bruta) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(bruta)) {
    return bruta.slice(0, 10);
  }

  const d = new Date(bruta);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return d.toISOString().slice(0, 10);
}

function formatarData(iso?: string | null): string {
  if (!iso) return "—";

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(d)
    .replace(".", "");
}

/* ------------------------- StatCard ------------------------- */

interface StatCardProps {
  icone: IconType;
  valor: number;
  titulo: string;
  descricao: string;
  corIcone: string;
  fundoIcone: string;
}

function StatCard({
  icone: Icone,
  valor,
  titulo,
  descricao,
  corIcone,
  fundoIcone,
}: StatCardProps): JSX.Element {
  return (
    <div className={`${cardClass} flex items-center gap-[16px] p-[22px]`}>
      <span
        className="w-[48px] h-[48px] shrink-0 flex items-center justify-center rounded-full"
        style={{ color: corIcone, backgroundColor: fundoIcone }}
      >
        <Icone className="w-[22px] h-[22px]" />
      </span>

      <div className="min-w-0">
        <strong className="block text-[28px] leading-[1.1] font-extrabold">
          {valor}
        </strong>

        <span className="block mt-[4px] text-[14px] font-semibold text-[#3d4b63]">
          {titulo}
        </span>

        <small className="block mt-[2px] text-[11.5px] text-[#667b9b]">
          {descricao}
        </small>
      </div>
    </div>
  );
}

/* ------------------------- Dashboard ------------------------- */

export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();

  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);

  const [resumo, setResumo] = useState<ResumoDashboard>({
    totalPublicacoes: 0,
    campanhasAtivas: 0,
    eventosProximos: 0,
    noticiasRecentes: 0,
    publicacoesPorCategoria: {
      campanha: 0,
      noticia: 0,
      evento: 0,
      publicacao: 0,
    },
  });

  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  const [avisoPermissao, setAvisoPermissao] = useState<
    "conteudo" | "animais" | null
  >(null);

  const { podeGerenciar } = useAuth();

  const podeGerenciarConteudo = podeGerenciar("conteudo");
  const podeGerenciarAnimais = podeGerenciar("animais");

  /* ------------------------- Carregamento ------------------------- */

  const carregar = useCallback(async (): Promise<void> => {
    setCarregando(true);
    setErro("");

    try {
      const [dadosResumo, dadosPublicacoes] = await Promise.all([
        publicacoesApi.resumoDashboard(),

        podeGerenciarConteudo
          ? publicacoesApi.listarAdmin()
          : Promise.resolve([]),
      ]);

      setResumo(dadosResumo);

      setPublicacoes(
        Array.isArray(dadosPublicacoes) ? dadosPublicacoes : []
      );
    } catch (e: unknown) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar os dados do dashboard."
      );
    } finally {
      setCarregando(false);
    }
  }, [podeGerenciarConteudo]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  /* ------------------------- Dados derivados ------------------------- */

  const publicacoesRecentes = [...publicacoes]
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .slice(0, 5);

  const categorias = CATEGORIAS.map((categoria) => ({
    ...categoria,
    posts: resumo.publicacoesPorCategoria[categoria.valor],
  }));

  const maiorQuantidade = Math.max(
    ...categorias.map((categoria) => categoria.posts),
    1
  );

  /* ------------------------- Navegação e ações ------------------------- */

  function criarArtigo(): void {
    if (!podeGerenciarConteudo) {
      setAvisoPermissao("conteudo");
      return;
    }

    navigate("/admin/publicacoes/nova");
  }

  function irParaAnimais(): void {
    if (!podeGerenciarAnimais) {
      setAvisoPermissao("animais");
      return;
    }

    navigate("/admin/animais");
  }

  async function excluirPublicacao(
    publicacao: Publicacao
  ): Promise<void> {
    if (
      !window.confirm(
        `Excluir a publicação "${publicacao.titulo}"?`
      )
    ) {
      return;
    }

    try {
      await publicacoesApi.excluir(publicacao.id);
      await carregar();
    } catch (e: unknown) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível excluir a publicação."
      );
    }
  }

  function verPublicacao(publicacao: Publicacao): void {
    navigate(`/admin/publicacoes/${publicacao.id}/preview`);
  }

  function editarPublicacao(publicacao: Publicacao): void {
    navigate(`/admin/publicacoes/${publicacao.id}/editar`);
  }

  /* ------------------------- Renderização ------------------------- */

  return (
    <div className="flex-1 min-w-0 min-h-screen flex flex-col font-['Inter',Arial,sans-serif] text-[#202b3e] bg-[#f0f0f0] box-border *:box-border">
      <AdminHeader titulo="Dashboard" />

      {/* Aviso de permissão */}
      {avisoPermissao && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) {
              setAvisoPermissao(null);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="aviso-permissao-titulo"
            aria-describedby="aviso-permissao-descricao"
            className="relative w-full max-w-[420px] rounded-[16px] bg-white p-7 text-center shadow-[0_8px_30px_rgb(0_0_0/30%)]"
          >
            <button
              type="button"
              onClick={() => setAvisoPermissao(null)}
              aria-label="Fechar aviso"
              className="absolute right-4 top-4 flex cursor-pointer border-0 bg-transparent p-1 text-[#667b9b] transition-colors hover:text-[#202b3e]"
            >
              <FiX className="h-5 w-5" />
            </button>

            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff6db] text-[#d99b00]">
              <FiAlertCircle
                aria-hidden="true"
                className="h-7 w-7"
              />
            </span>

            <h2
              id="aviso-permissao-titulo"
              className="m-0 mb-2 text-[20px] font-extrabold text-[#202b3e]"
            >
              Permissão necessária
            </h2>

            <p
              id="aviso-permissao-descricao"
              className="m-0 mb-6 text-[14px] leading-relaxed text-[#667b9b]"
            >
              {avisoPermissao === "conteudo"
                ? "Você não possui permissão para criar artigos. Atualmente, seu cargo permite apenas gerenciar animais."
                : "Você não possui permissão para gerenciar animais. Atualmente, seu cargo permite apenas gerenciar publicações."}
            </p>

            <button
              type="button"
              autoFocus
              onClick={() => setAvisoPermissao(null)}
              className="h-10 cursor-pointer rounded-[8px] border-0 bg-[#2174b7] px-6 text-[14px] font-bold text-white transition-colors hover:bg-[#1767a8]"
            >
              Entendi
            </button>
          </section>
        </div>
      )}

      <main className="flex-1 flex flex-col gap-[28px] p-[18px] sm:p-[24px] lg:p-[32px]">
        {/* Mensagem de erro */}
        {erro && (
          <div
            role="alert"
            className="rounded-[8px] border border-red-200 bg-red-50 p-[12px] text-[13px] text-red-700"
          >
            {erro}
          </div>
        )}

        {/* Cards de resumo: somente publicações */}
        <section
          aria-label="Resumo"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[16px]"
        >
          <StatCard
            icone={LuFileText}
            valor={carregando ? 0 : resumo.totalPublicacoes}
            titulo="Total Publicações"
            descricao="Total cadastrado"
            corIcone="#2174b7"
            fundoIcone="#e8f3fd"
          />

          <StatCard
            icone={LuMegaphone}
            valor={carregando ? 0 : resumo.campanhasAtivas}
            titulo="Campanhas Ativas"
            descricao="Arrecadações em andamento"
            corIcone="#ffb800"
            fundoIcone="#fff6db"
          />

          <StatCard
            icone={LuCalendar}
            valor={carregando ? 0 : resumo.eventosProximos}
            titulo="Eventos Próximos"
            descricao="Próximos 30 dias"
            corIcone="#10b981"
            fundoIcone="#e3f8ef"
          />

          <StatCard
            icone={LuHeart}
            valor={carregando ? 0 : resumo.noticiasRecentes}
            titulo="Notícias Recentes"
            descricao="Publicadas esta semana"
            corIcone="#8b5cf6"
            fundoIcone="#f0eafd"
          />
        </section>

        {/* Ações rápidas */}
        <section aria-labelledby="titulo-acoes">
          <h2
            id="titulo-acoes"
            className="m-0 mb-[16px] text-[20px] leading-[1.25] tracking-[-0.3px] font-extrabold"
          >
            Ações Rápidas
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px]">
            <div className={`${cardClass} p-[22px]`}>
              <h3 className="m-0 mb-[8px] text-[17px] font-extrabold">
                Nova Publicação
              </h3>

              <p className="m-0 mb-[12px] text-[#667b9b] text-[13.5px]">
                Crie conteúdos para o portal público
              </p>

              <button
                type="button"
                onClick={criarArtigo}
                className="h-[32px] px-[14px] inline-flex items-center gap-[6px] text-white font-inherit text-[13px] font-bold bg-[#2174b7] border-0 rounded-[6px] cursor-pointer transition-colors duration-150 hover:bg-[#1767a8]"
              >
                <FiPlus className="w-[14px] h-[14px]" />
                Criar Artigo
              </button>
            </div>

            <div className={`${cardClass} p-[22px]`}>
              <h3 className="m-0 mb-[8px] text-[17px] font-extrabold">
                Gerenciar Animais
              </h3>

              <p className="m-0 mb-[12px] text-[#667b9b] text-[13.5px]">
                Veja, adicione ou edite os animais da ONG
              </p>

              <button
                type="button"
                onClick={irParaAnimais}
                className="h-[32px] px-[14px] text-black font-inherit text-[13px] font-bold bg-[#ffb800] border-0 rounded-[6px] cursor-pointer transition-colors duration-150 hover:bg-[#e6a600]"
              >
                Ir para Animais
              </button>
            </div>

            <div className={`${cardClass} p-[22px]`}>
              <h3 className="m-0 mb-[8px] text-[17px] font-extrabold">
                Ver Publicações
              </h3>

              <p className="m-0 mb-[12px] text-[#667b9b] text-[13.5px]">
                Edite, remova ou agende suas postagens
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/publicacoes")}
                className="h-[32px] px-[14px] text-[#202b3e] font-inherit text-[13px] font-bold bg-[#eef2f6] border-0 rounded-[6px] cursor-pointer transition-colors duration-150 hover:bg-[#e2e8ef]"
              >
                Acessar Lista
              </button>
            </div>
          </div>
        </section>

        {/* Tabela + categorias */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_332px] gap-[16px] items-start">
          {/* Publicações recentes */}
          <section
            className={`${cardClass} p-[24px]`}
            aria-labelledby="titulo-recentes"
          >
            <h2
              id="titulo-recentes"
              className="m-0 mb-[16px] text-[20px] leading-[1.25] tracking-[-0.3px] font-extrabold"
            >
              Publicações Recentes
            </h2>

            <div className="overflow-x-auto border border-[#e8edf3] rounded-[4px]">
              <table className="w-full min-w-[620px] border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="bg-[#f7f9fb] text-[#667b9b] text-[12px] font-bold">
                    <th className="py-[14px] px-[16px] font-bold">
                      Título
                    </th>
                    <th className="py-[14px] px-[16px] font-bold">
                      Categoria
                    </th>
                    <th className="py-[14px] px-[16px] font-bold">
                      Data
                    </th>
                    <th className="py-[14px] px-[16px] font-bold">
                      Status
                    </th>
                    <th className="py-[14px] px-[16px] font-bold">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {carregando ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-[32px] px-[16px] text-center text-[#667b9b]"
                      >
                        Carregando publicações...
                      </td>
                    </tr>
                  ) : !podeGerenciarConteudo ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-[32px] px-[16px] text-center text-[#667b9b]"
                      >
                        Você não possui permissão para visualizar as publicações.
                      </td>
                    </tr>
                  ) : publicacoesRecentes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-[32px] px-[16px] text-center text-[#667b9b]"
                      >
                        Nenhuma publicação cadastrada ainda.
                      </td>
                    </tr>
                  ) : (
                    publicacoesRecentes.map((publicacao) => (
                      <tr
                        key={publicacao.id}
                        className="border-t border-[#e8edf3]"
                      >
                        <td className="py-[16px] px-[16px] font-bold">
                          {publicacao.titulo || "Sem título"}
                        </td>

                        <td className="py-[16px] px-[16px] text-[#3d4b63]">
                          {NOME_CATEGORIA[publicacao.categoria] || "—"}
                        </td>

                        <td className="py-[16px] px-[16px] text-[#667b9b] whitespace-nowrap">
                          {formatarData(
                            extrairDataISO(
                              publicacao.dataEventoCampanha ??
                                publicacao.criadoEm
                            )
                          )}
                        </td>

                        <td className="py-[16px] px-[16px]">
                          <span
                            className={`inline-block rounded-[4px] px-2 py-1 text-[11px] font-bold ${CLASSE_STATUS[publicacao.status]}`}
                          >
                            {NOME_STATUS[publicacao.status]}
                          </span>
                        </td>

                        <td className="py-[16px] px-[16px]">
                          <div className="flex items-center gap-[10px] text-[#687d9a]">
                            <button
                              type="button"
                              aria-label={`Ver ${publicacao.titulo}`}
                              onClick={() => verPublicacao(publicacao)}
                              className="p-0 flex bg-transparent border-0 text-inherit cursor-pointer hover:text-[#2174b7]"
                            >
                              <FiEye className="w-[17px] h-[17px]" />
                            </button>

                            <button
                              type="button"
                              aria-label={`Editar ${publicacao.titulo}`}
                              onClick={() => editarPublicacao(publicacao)}
                              className="p-0 flex bg-transparent border-0 text-inherit cursor-pointer hover:text-[#2174b7]"
                            >
                              <FiEdit className="w-[17px] h-[17px]" />
                            </button>

                            <button
                              type="button"
                              aria-label={`Excluir ${publicacao.titulo}`}
                              onClick={() => excluirPublicacao(publicacao)}
                              className="p-0 flex bg-transparent border-0 text-inherit cursor-pointer hover:text-[#c0392b]"
                            >
                              <FiTrash2 className="w-[17px] h-[17px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Postagens por categoria */}
          <section
            className={`${cardClass} p-[24px]`}
            aria-labelledby="titulo-categorias"
          >
            <h2
              id="titulo-categorias"
              className="m-0 mb-[16px] text-[20px] leading-[1.25] tracking-[-0.3px] font-extrabold"
            >
              Postagens por Categoria
            </h2>

            <ul className="m-0 p-0 list-none flex flex-col gap-[14px]">
              {categorias.map((categoria) => (
                <li key={categoria.nome}>
                  <div className="flex items-center justify-between mb-[6px] text-[13.5px]">
                    <strong className="font-bold">
                      {categoria.nome}
                    </strong>

                    <span className="text-[#667b9b] text-[12.5px]">
                      {categoria.posts} posts
                    </span>
                  </div>

                  <div className="h-[8px] bg-[#eef2f6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (categoria.posts / maiorQuantidade) * 100
                        }%`,
                        backgroundColor: categoria.cor,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Indicadores de animais */}
        {podeGerenciarAnimais && (
          <section
            aria-label="Indicadores de Animais"
            className={`${cardClass} p-[24px]`}
          >
            <h2 className="m-0 mb-[16px] text-[20px] leading-[1.25] tracking-[-0.3px] font-extrabold">
              Indicadores de Animais
            </h2>

            {/* Indicadores principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[16px]">
              <StatCard
                icone={LuPawPrint}
                valor={carregando ? 0 : resumo.animais?.total ?? 0}
                titulo="Total de Animais"
                descricao="Cadastrados no sistema"
                corIcone="#10b981"
                fundoIcone="#e3f8ef"
              />

              <StatCard
                icone={LuPawPrint}
                valor={carregando ? 0 : resumo.animais?.disponiveis ?? 0}
                titulo="Disponíveis"
                descricao="Aguardando adoção"
                corIcone="#2174b7"
                fundoIcone="#e8f3fd"
              />

              <StatCard
                icone={LuPawPrint}
                valor={carregando ? 0 : resumo.animais?.adotados ?? 0}
                titulo="Adotados"
                descricao="Com lares confirmados"
                corIcone="#8b5cf6"
                fundoIcone="#f0eafd"
              />
            </div>

            {/* Indicadores detalhados */}
            <div className="mt-[16px] grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              {/* Vacinação */}
              <div className={`${cardClass} p-[20px]`}>
                <h3 className="m-0 mb-[12px] text-[15px] font-extrabold">
                  Vacinação
                </h3>

                <div className="flex items-center gap-[16px] mb-[8px] text-[14px]">
                  <span className="font-bold text-[#10b981]">
                    {carregando
                      ? 0
                      : resumo.animais?.vacinacao?.dia ?? 0}
                  </span>

                  <span className="text-[13px] text-[#667b9b]">
                    Vacinação em dia
                  </span>
                </div>

                <div className="flex items-center gap-[16px] text-[14px]">
                  <span className="font-bold text-[#c0392b]">
                    {carregando
                      ? 0
                      : resumo.animais?.vacinacao?.naoDia ?? 0}
                  </span>

                  <span className="text-[13px] text-[#667b9b]">
                    Vacinação não está em dia
                  </span>
                </div>
              </div>

              {/* Castração */}
              <div className={`${cardClass} p-[20px]`}>
                <h3 className="m-0 mb-[12px] text-[15px] font-extrabold">
                  Castração
                </h3>

                <div className="grid grid-cols-2 gap-[8px] text-[13px]">
                  <div>
                    <span className="font-bold text-[#2174b7]">
                      {carregando
                        ? 0
                        : resumo.animais?.castracao?.castrado ?? 0}
                    </span>{" "}
                    Castrado(a)
                  </div>

                  <div>
                    <span className="font-bold text-[#f59e0b]">
                      {carregando
                        ? 0
                        : resumo.animais?.castracao?.pendente ?? 0}
                    </span>{" "}
                    Pendente
                  </div>

                  <div>
                    <span className="font-bold text-[#8b5cf6]">
                      {carregando
                        ? 0
                        : resumo.animais?.castracao?.agendada ?? 0}
                    </span>{" "}
                    Agendada
                  </div>

                  <div>
                    <span className="font-bold text-[#667b9b]">
                      {carregando
                        ? 0
                        : resumo.animais?.castracao?.naoInformado ?? 0}
                    </span>{" "}
                    Não informado
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}