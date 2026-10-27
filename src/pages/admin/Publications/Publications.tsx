import { useCallback, useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuChevronLeft,
  LuChevronRight,
  LuEye,
  LuPencil,
  LuPlus,
  LuSearch,
  LuStar,
  LuTrash2,
} from "react-icons/lu";

import { publicacoesApi } from "../../../services/publicacoesApi";
import type {
  CategoriaConteudo,
  Publicacao,
  StatusPublicacao,
} from "../../../services/publicacoesApi";
import AdminHeader from "../../../components/layout/adminHeader";

type CategoriaFiltro = "todas" | CategoriaConteudo;
type StatusFiltro = "todos" | StatusPublicacao;
const POR_PAGINA = 8;

const statusTexto: Record<StatusPublicacao, string> = {
  publicado: "Publicado",
  agendado: "Agendado",
  rascunho: "Rascunho",
  arquivado: "Arquivado",
};

const statusClasse: Record<StatusPublicacao, string> = {
  publicado: "bg-[#e3f8ef] text-[#10b981]",
  agendado: "bg-[#e5eefd] text-[#3b82f6]",
  rascunho: "bg-[#ebeef2] text-[#667b9b]",
  arquivado: "bg-[#ebeef2] text-[#667b9b]",
};

const categorias: Record<CategoriaConteudo, string> = {
  noticia: "Notícia",
  evento: "Evento",
  campanha: "Campanha",
  publicacao: "Publicação",
};

function mensagem(e: unknown): string {
  return e instanceof Error ? e.message : "";
}

function formatarData(data: string | null): string {
  if (!data) return "—";
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return data;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valor);
}

const cardClass =
  "rounded-[12px] border border-[#e2e2e2] bg-white shadow-[0_2px_3px_rgb(0_0_0/12%)]";
const selectClass =
  "h-[38px] cursor-pointer rounded-[8px] border border-[#dce5ef] bg-white px-3 text-[13.5px] text-[#273449] outline-none focus:border-[#2174b7] focus:ring-4 focus:ring-[#2174b7]/10";

export default function Publications(): JSX.Element {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<CategoriaFiltro>("todas");
  const [status, setStatus] = useState<StatusFiltro>("todos");
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const carregar = useCallback(async (): Promise<void> => {
    setCarregando(true);
    setErro("");
    try {
      setPublicacoes(await publicacoesApi.listarAdmin());
    } catch (e: unknown) {
      setErro(
        mensagem(e) ||
          "Não foi possível carregar os conteúdos. Confira se o backend está em execução."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return publicacoes.filter((item) => {
      const correspondeBusca =
        !termo ||
        `${item.titulo} ${item.descricaoConteudo ?? ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(termo);
      return (
        correspondeBusca &&
        (categoria === "todas" || item.categoria === categoria) &&
        (status === "todos" || item.status === status)
      );
    });
  }, [publicacoes, busca, categoria, status]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const itensPagina = filtradas.slice(
    (paginaAtual - 1) * POR_PAGINA,
    paginaAtual * POR_PAGINA
  );
  const todosDaPaginaSelecionados =
    itensPagina.length > 0 &&
    itensPagina.every((item) => selecionados.includes(item.id));

  function selecionarPagina(): void {
    setSelecionados((atuais) =>
      todosDaPaginaSelecionados
        ? atuais.filter((id) => !itensPagina.some((item) => item.id === id))
        : [...new Set([...atuais, ...itensPagina.map((item) => item.id)])]
    );
  }

  async function excluirSelecionados(): Promise<void> {
    if (
      !selecionados.length ||
      !window.confirm(`Excluir ${selecionados.length} conteúdo(s) selecionado(s)?`)
    ) {
      return;
    }
    setErro("");
    try {
      await Promise.all(selecionados.map((id) => publicacoesApi.excluir(id)));
      setSelecionados([]);
      await carregar();
    } catch (e: unknown) {
      setErro(mensagem(e) || "Não foi possível excluir os conteúdos selecionados.");
    }
  }

  async function publicarSelecionados(): Promise<void> {
    const selecionadosAtuais = publicacoes.filter((item) =>
      selecionados.includes(item.id)
    );
    if (!selecionadosAtuais.length) return;
    setErro("");
    try {
      await Promise.all(
        selecionadosAtuais.map((item) =>
          publicacoesApi.salvar({ ...item, status: "publicado" }, item.id)
        )
      );
      setSelecionados([]);
      await carregar();
    } catch (e: unknown) {
      setErro(mensagem(e) || "Não foi possível publicar os conteúdos selecionados.");
    }
  }

  async function excluir(item: Publicacao): Promise<void> {
    if (!window.confirm(`Deseja excluir "${item.titulo}"?`)) return;
    try {
      await publicacoesApi.excluir(item.id);
      setSelecionados((atuais) => atuais.filter((id) => id !== item.id));
      await carregar();
    } catch (e: unknown) {
      setErro(mensagem(e) || "Não foi possível excluir o conteúdo.");
    }
  }

  async function alternarDestaque(item: Publicacao): Promise<void> {
    setErro("");
    try {
      await publicacoesApi.salvar(
        { ...item, destaque: !item.destaque },
        item.id
      );
      await carregar();
    } catch (e: unknown) {
      setErro(mensagem(e) || "Não foi possível alterar o destaque.");
    }
  }

  async function alternarStatus(item: Publicacao): Promise<void> {
    const novoStatus: StatusPublicacao =
      item.status === "publicado" ? "rascunho" : "publicado";
    setErro("");
    try {
      await publicacoesApi.salvar({ ...item, status: novoStatus }, item.id);
      await carregar();
    } catch (e: unknown) {
      setErro(mensagem(e) || "Não foi possível alterar o status.");
    }
  }

  return (
    <div className="box-border flex min-h-screen min-w-0 flex-1 flex-col bg-[#f0f0f0] font-['Inter',Arial,sans-serif] text-[#202b3e] *:box-border">
      <AdminHeader titulo="Gerenciar Publicações" />
      <main className="flex flex-1 flex-col gap-5 p-5 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-[15px] text-[#667b9b]">
            Gerencie notícias, eventos, campanhas e publicações do portal.
          </p>
          <div className="flex gap-2">
            {selecionados.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => void publicarSelecionados()}
                  className="flex h-[40px] cursor-pointer items-center gap-2 rounded-[8px] border border-[#dce5ef] bg-white px-4 text-[13.5px] font-bold text-[#10a36c] hover:bg-[#f1fbf6]"
                >
                  Publicar ({selecionados.length})
                </button>
                <button
                  type="button"
                  onClick={() => void excluirSelecionados()}
                  className="flex h-[40px] cursor-pointer items-center gap-2 rounded-[8px] border border-red-200 bg-white px-4 text-[13.5px] font-bold text-red-700 hover:bg-red-50"
                >
                  <LuTrash2 size={17} />
                  Excluir ({selecionados.length})
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => navigate("/admin/publicacoes/nova")}
              className="flex h-[40px] cursor-pointer items-center gap-2 rounded-[8px] border-0 bg-[#2174b7] px-5 text-[13.5px] font-bold text-white shadow-[0_2px_3px_rgb(0_0_0/22%)] transition-colors hover:bg-[#1767a8]"
            >
              <LuPlus size={18} /> Novo Conteúdo
            </button>
          </div>
        </div>

        {erro && (
          <div
            role="alert"
            className="rounded-[8px] border border-[#f9c4be] bg-[#fff1f0] px-3.5 py-2.5 text-[13px] font-semibold text-[#b42318]"
          >
            {erro}
          </div>
        )}

        <section className={`${cardClass} flex flex-wrap items-center gap-3 p-3.5`}>
          <label className="relative flex h-[38px] min-w-[220px] flex-1 items-center rounded-[8px] border border-[#dce5ef] bg-[#f7f9fb] focus-within:border-[#2174b7] focus-within:ring-4 focus-within:ring-[#2174b7]/10">
            <LuSearch className="absolute left-[12px] text-[#687d9a]" size={17} />
            <input
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por título ou conteúdo..."
              aria-label="Buscar por título ou conteúdo"
              className="w-full min-w-0 border-0 bg-transparent py-0 pl-10 pr-3 text-[13.5px] text-[#273449] outline-none placeholder:text-[#8a9ab2]"
            />
          </label>
          <select
            aria-label="Filtrar por categoria"
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value as CategoriaFiltro);
              setPagina(1);
            }}
            className={selectClass}
          >
            <option value="todas">Todas as categorias</option>
            {Object.entries(categorias).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFiltro);
              setPagina(1);
            }}
            className={selectClass}
          >
            <option value="todos">Todos os status</option>
            <option value="publicado">Publicado</option>
            <option value="agendado">Agendado</option>
            <option value="rascunho">Rascunho</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </section>

        <section className={`${cardClass} overflow-hidden`}>
          {carregando ? (
            <p className="m-0 p-12 text-center text-[14px] text-[#667b9b]">
              Carregando conteúdos...
            </p>
          ) : itensPagina.length === 0 ? (
            <div className="p-12 text-center">
              <p className="m-0 font-bold">Nenhum conteúdo encontrado</p>
              <p className="m-0 mt-2 text-[13.5px] text-[#667b9b]">
                Altere os filtros ou crie um novo conteúdo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left text-[13.5px]">
                <thead className="bg-[#f7f9fb] text-[12px] font-bold text-[#667b9b]">
                  <tr>
                    <th className="w-10 py-3.5 pl-4 pr-2">
                      <input
                        type="checkbox"
                        aria-label="Selecionar conteúdos desta página"
                        checked={todosDaPaginaSelecionados}
                        onChange={selecionarPagina}
                        className="h-[16px] w-[16px] cursor-pointer accent-[#2174b7]"
                      />
                    </th>
                    <th className="px-2 py-3.5">Img</th>
                    <th className="px-2 py-3.5">Título</th>
                    <th className="px-2 py-3.5">Categoria</th>
                    <th className="px-2 py-3.5">Data do evento</th>
                    <th className="px-2 py-3.5">Status</th>
                    <th className="px-2 py-3.5 text-center">Destaque</th>
                    <th className="px-2 py-3.5">Autor(a)</th>
                    <th className="px-2 py-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itensPagina.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#e8edf3] bg-white transition hover:bg-[#f7f9fb]"
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          aria-label={`Selecionar ${item.titulo}`}
                          checked={selecionados.includes(item.id)}
                          onChange={() =>
                            setSelecionados((atuais) =>
                              atuais.includes(item.id)
                                ? atuais.filter((id) => id !== item.id)
                                : [...atuais, item.id]
                            )
                          }
                          className="h-[16px] w-[16px] cursor-pointer accent-[#2174b7]"
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        {item.imagem ? (
                          <img
                            src={item.imagem}
                            alt=""
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-[#eef2f6]" />
                        )}
                      </td>
                      <td
                        className="max-w-[300px] truncate px-2 py-3 font-bold"
                        title={item.titulo}
                      >
                        {item.titulo}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-[#3d4b63]">
                        {categorias[item.categoria]}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-[#667b9b]">
                        {formatarData(item.dataEventoCampanha)}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => void alternarStatus(item)}
                          title="Alternar entre publicado e rascunho"
                          className={`cursor-pointer rounded px-2 py-1 text-[11.5px] font-bold ${statusClasse[item.status]}`}
                        >
                          {statusTexto[item.status]}
                        </button>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button
                          type="button"
                          title={item.destaque ? "Remover destaque" : "Destacar"}
                          onClick={() => void alternarDestaque(item)}
                          className={`cursor-pointer border-0 bg-transparent p-0 ${
                            item.destaque
                              ? "text-destaque"
                              : "text-[#c3cedc] hover:text-destaque"
                          }`}
                        >
                          <LuStar
                            size={18}
                            fill={item.destaque ? "currentColor" : "none"}
                          />
                        </button>
                      </td>
                      <td className="max-w-[150px] truncate px-2 py-3 text-[#667b9b]">
                        {item.autor || "—"}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center gap-3 text-[#687d9a]">
                          <button
                            type="button"
                            title="Pré-visualizar"
                            onClick={() =>
                              navigate(`/admin/publicacoes/${item.id}/preview`)
                            }
                            className="cursor-pointer border-0 bg-transparent p-0 hover:text-[#2174b7]"
                          >
                            <LuEye size={17} />
                          </button>
                          <button
                            type="button"
                            title="Editar"
                            onClick={() =>
                              navigate(`/admin/publicacoes/${item.id}/editar`)
                            }
                            className="cursor-pointer border-0 bg-transparent p-0 hover:text-[#2174b7]"
                          >
                            <LuPencil size={17} />
                          </button>
                          <button
                            type="button"
                            title="Excluir"
                            onClick={() => void excluir(item)}
                            className="cursor-pointer border-0 bg-transparent p-0 hover:text-red-600"
                          >
                            <LuTrash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!carregando && filtradas.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#e8edf3] px-4 py-3">
              <span className="text-[12px] text-[#667b9b]">
                {filtradas.length} conteúdo(s)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled={paginaAtual <= 1}
                  onClick={() => setPagina(paginaAtual - 1)}
                  className="cursor-pointer border-0 bg-transparent p-1 text-[#687d9a] disabled:opacity-40"
                >
                  <LuChevronLeft size={18} />
                </button>
                <span className="text-[12px] text-[#667b9b]">
                  {paginaAtual} / {totalPaginas}
                </span>
                <button
                  type="button"
                  aria-label="Próxima página"
                  disabled={paginaAtual >= totalPaginas}
                  onClick={() => setPagina(paginaAtual + 1)}
                  className="cursor-pointer border-0 bg-transparent p-1 text-[#687d9a] disabled:opacity-40"
                >
                  <LuChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
