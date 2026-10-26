import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicFooter from "../../../components/layout/PublicFooter";
import { IconPaw } from "../../../components/layout/Icons";
import {
  formatarDataExtenso,
  nomeCategoria,
  resumoConteudo,
} from "../../../data/publicacoes";
import { publicacoesApi } from "../../../services/publicacoesApi";
import type { Publicacao } from "../../../services/publicacoesApi";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) {
      setErro("ID da publicação não informado.");
      setCarregando(false);
      return;
    }

    let ativo = true;
    publicacoesApi
      .buscar(id)
      .then((dados) => {
        if (ativo) setPublicacao(dados);
      })
      .catch((e: unknown) => {
        if (ativo) {
          setErro(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar a publicação."
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  return (
    <>
      <div className="bg-white px-5 py-10 md:px-5 lg:px-14">
        <article className="relative mx-auto max-w-5xl">
          {carregando ? (
            <p className="py-16 text-center text-sm text-zinc-500">
              Carregando publicação...
            </p>
          ) : erro || !publicacao ? (
            <section className="py-16 text-center">
              <h1 className="text-2xl font-extrabold text-zinc-800">
                Publicação não encontrada
              </h1>
              <p role={erro ? "alert" : undefined} className="mt-2 text-sm text-zinc-500">
                {erro || "Ela pode ter sido removida ou o link está incorreto."}
              </p>
              <Link
                to="/campanhas-e-noticias"
                className="mt-6 inline-block rounded-lg bg-marca px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                Ver todas as publicações
              </Link>
            </section>
          ) : (
            <>
              <header className="mb-6 md:pr-16">
                <span className="inline-block rounded-full bg-destaque px-4 py-1.5 text-[11px] font-bold uppercase text-zinc-900">
                  {nomeCategoria[publicacao.categoria]}
                </span>
                {publicacao.urgente && (
                  <span className="ml-2 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-[11px] font-bold uppercase text-amber-800">
                    Campanha urgente
                  </span>
                )}
                {publicacao.destaque && (
                  <span className="ml-2 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-[11px] font-bold uppercase text-blue-800">
                    Em destaque
                  </span>
                )}
                <h1 className="mt-4 text-2xl font-extrabold leading-tight text-zinc-900 md:text-[40px]">
                  {publicacao.titulo}
                </h1>
                {publicacao.dataEventoCampanha && (
                  <p className="mt-2 text-xs text-slate-500 md:text-sm">
                    {formatarDataExtenso(publicacao.dataEventoCampanha)}
                  </p>
                )}
                {publicacao.autor && (
                  <p className="mt-1 text-sm text-slate-500">
                    Por {publicacao.autor}
                  </p>
                )}
                {publicacao.imagem && (
                  <img
                    src={publicacao.imagem}
                    alt={publicacao.titulo}
                    className="mb-6 mt-5 max-h-[440px] w-full rounded-2xl object-cover"
                  />
                )}
                {publicacao.localEventoCampanha && (
                  <p className="mt-1 text-sm text-slate-500">
                    Local: {publicacao.localEventoCampanha}
                  </p>
                )}
              </header>

              {publicacao.urlVideo && (
                <iframe
                  src={publicacao.urlVideo}
                  title={`Vídeo: ${publicacao.titulo}`}
                  className="mb-6 aspect-video w-full rounded-2xl border-0"
                  allowFullScreen
                />
              )}

              {publicacao.descricaoConteudo && (
                <p className="whitespace-pre-line text-base leading-7 text-zinc-700">
                  {resumoConteudo(publicacao)}
                </p>
              )}

              <aside className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#f8f9fb] px-5 py-6 md:flex-row md:items-center md:justify-between md:px-10">
                <div>
                  <p className="text-sm font-bold text-marca md:text-lg">
                    Apoie nossa causa
                  </p>
                  <p className="text-xs text-zinc-500 md:text-sm">
                    Juntos fazemos a diferença na vida dos animais!
                  </p>
                </div>
                <a
                  href={publicacao.urlArrecadacao || "/como-ajudar"}
                  target={publicacao.urlArrecadacao ? "_blank" : undefined}
                  rel={publicacao.urlArrecadacao ? "noreferrer" : undefined}
                  className="flex items-center justify-center gap-2 rounded-full bg-destaque px-8 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-destaque-escura"
                >
                  Quero ajudar
                  <IconPaw className="h-4 w-4" />
                </a>
              </aside>
            </>
          )}
        </article>
      </div>
      <PublicFooter />
    </>
  );
}
