import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Link, useParams } from "react-router-dom";
import { LuMonitor, LuSmartphone } from "react-icons/lu";

import { publicacoesApi } from "../../../services/publicacoesApi";
import { resumoConteudo } from "../../../data/publicacoes";
import type {
  CategoriaConteudo,
  Publicacao,
} from "../../../services/publicacoesApi";
import logoImg from "../../../assets/logo.svg";

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
  if (!data) return "";
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return data;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(valor);
}

const cardClass =
  "rounded-[12px] border border-[#e2e2e2] bg-white shadow-[0_2px_3px_rgb(0_0_0/22%)]";

export default function PublicationPreview(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [erro, setErro] = useState("");
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (!id) {
      setErro("ID do conteúdo não informado.");
      return;
    }
    let ativo = true;
    publicacoesApi
      .buscarAdmin(id)
      .then((dados) => {
        if (ativo) setPublicacao(dados);
      })
      .catch((e: unknown) => {
        if (ativo) setErro(mensagem(e));
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  if (erro) {
    return (
      <main className="p-8">
        <p role="alert" className="text-red-700">{erro}</p>
        <Link to="/admin/publicacoes">Voltar aos conteúdos</Link>
      </main>
    );
  }
  if (!publicacao) {
    return <main className="p-8 text-slate-500">Carregando pré-visualização...</main>;
  }

  return (
    <div className="box-border flex min-h-screen min-w-0 flex-1 flex-col bg-[#f0f0f0] font-['Inter',Arial,sans-serif] text-[#202b3e] *:box-border">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-[#e2e2e2] bg-white py-4 pl-[72px] pr-5 sm:pr-8 lg:px-8 lg:py-5">
        <div className="flex items-center gap-3.5">
          <h1 className="m-0 text-[22px] font-extrabold sm:text-[26px]">
            Pré-visualização
          </h1>
          <div className="flex gap-1 rounded-[8px] bg-[#eef2f6] p-1">
            <button
              type="button"
              title="Desktop"
              onClick={() => setMobile(false)}
              className={`grid h-[28px] w-[30px] cursor-pointer place-items-center rounded-[6px] border-0 ${
                !mobile ? "bg-white text-[#2174b7] shadow-sm" : "bg-transparent text-[#687d9a]"
              }`}
            >
              <LuMonitor size={16} />
            </button>
            <button
              type="button"
              title="Celular"
              onClick={() => setMobile(true)}
              className={`grid h-[28px] w-[30px] cursor-pointer place-items-center rounded-[6px] border-0 ${
                mobile ? "bg-white text-[#2174b7] shadow-sm" : "bg-transparent text-[#687d9a]"
              }`}
            >
              <LuSmartphone size={16} />
            </button>
          </div>
        </div>
        <Link
          to={`/admin/publicacoes/${id}/editar`}
          className="flex h-[36px] items-center rounded-[8px] border border-[#dce5ef] bg-white px-4 text-[13px] font-bold text-[#667b9b] no-underline transition-colors hover:bg-[#f7f9fb]"
        >
          Voltar para edição
        </Link>
      </header>

      <main className="flex-1 p-5 sm:p-6 lg:p-8">
        <section
          className={`${cardClass} mx-auto min-h-[520px] overflow-hidden ${
            mobile ? "w-[390px] max-w-full" : "w-full max-w-5xl"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-[#eef2f6] px-6 py-4">
            <img src={logoImg} alt="Logo Focinho Amigo" className="h-10 w-10 object-contain" />
            <strong className="text-[18px] font-extrabold text-[#2174b7]">
              Focinho Amigo
            </strong>
          </div>
          <article className={mobile ? "p-5" : "p-8"}>
            {publicacao.imagem && (
              <img
                src={publicacao.imagem}
                alt={publicacao.titulo}
                className="mb-6 max-h-[360px] w-full rounded-[20px] object-cover"
              />
            )}
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase text-[#2174b7]">
              {categorias[publicacao.categoria]}
            </span>
            <span className="ml-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase text-slate-600">
              {publicacao.status}
            </span>
            {publicacao.urgente && (
              <span className="ml-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase text-amber-800">
                Campanha urgente
              </span>
            )}
            {publicacao.destaque && (
              <span className="ml-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase text-blue-800">
                Em destaque
              </span>
            )}
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-zinc-900 md:text-4xl">
              {publicacao.titulo}
            </h2>
            {publicacao.dataEventoCampanha && (
              <p className="mt-2 text-sm text-slate-500">
                {formatarData(publicacao.dataEventoCampanha)}
              </p>
            )}
            {publicacao.autor && (
              <p className="mt-1 text-sm text-slate-500">
                Por {publicacao.autor}
              </p>
            )}
            {publicacao.resumo && (
              <p className="mt-4 text-base font-semibold leading-7 text-zinc-700">
                {publicacao.resumo}
              </p>
            )}
            {publicacao.localEventoCampanha && (
              <p className="mt-1 text-sm text-slate-500">
                Local: {publicacao.localEventoCampanha}
              </p>
            )}
            {publicacao.urlVideo && (
              <iframe
                src={publicacao.urlVideo}
                title={`Vídeo: ${publicacao.titulo}`}
                className="mt-6 aspect-video w-full rounded-xl border-0"
                allowFullScreen
              />
            )}
            {publicacao.descricaoConteudo && (
              <p className="mt-6 whitespace-pre-line text-base leading-7 text-zinc-700">
                {resumoConteudo(publicacao)}
              </p>
            )}
            {publicacao.urlArrecadacao && (
              <a
                href={publicacao.urlArrecadacao}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block rounded-lg bg-[#2174b7] px-5 py-3 text-sm font-bold text-white no-underline"
              >
                Contribuir
              </a>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
