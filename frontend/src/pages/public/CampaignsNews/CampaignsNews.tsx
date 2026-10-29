import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import PageHero from "../../../components/layout/PageHero";
import type { CSSProperties } from "react";
import CampanhasCarrossel from "../../../components/layout/CampanhasCarrossel";
import {
  IconFacebook,
  IconInstagram,
  IconTikTok,
  type IconProps,
} from "../../../components/layout/Icons";
import {
  formatarDataCurta,
  nomeCategoria,
  resumoConteudo,
} from "../../../lib/publicacoesUtils";;
import { publicacoesApi } from "../../../services/publicacoesApi";
import type {
  CategoriaConteudo,
  Publicacao,
} from "../../../services/publicacoesApi";

// Imagens ficam na pasta public: /images/eventos/<arquivo>

type Filtro =
  | "Todas"
  | "Notícias"
  | "Eventos"
  | "Campanhas"
  | "Publicações";

interface Rede {
  nome: string;
  seguidores: string;
  href: string;
  Icone: ComponentType<IconProps>;
  corIcone: string;
  corNumero: string;
  estilo: CSSProperties; // borda colorida do card
}

const filtros: Filtro[] = [
  "Todas",
  "Notícias",
  "Eventos",
  "Campanhas",
  "Publicações",
];

const categoriaDoFiltro: Record<Exclude<Filtro, "Todas">, CategoriaConteudo> = {
  "Notícias": "noticia",
  Eventos: "evento",
  Campanhas: "campanha",
  "Publicações": "publicacao",
};

// TODO: trocar pelos perfis e números reais
const redes: Rede[] = [
  {
    nome: "Instagram",
    seguidores: "21K seguidores",
    href: "https://www.instagram.com/focinhoamigoindaiatuba/",
    Icone: IconInstagram,
    corIcone: "#d62976",
    corNumero: "#d62976",
    estilo: {
      border: "2px solid transparent",
      background:
        "linear-gradient(#fff,#fff) padding-box, linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5) border-box",
    },
  },
  {
    nome: "Facebook",
    seguidores: "12K seguidores",
    href: "https://www.facebook.com/FocinhoAmigoIndaiatuba",
    Icone: IconFacebook,
    corIcone: "#1877f2",
    corNumero: "#1877f2",
    estilo: { border: "2px solid #1877f2", background: "#fff" },
  },
  {
    nome: "TikTok",
    seguidores: "2K seguidores",
    href: "https://www.tiktok.com/@focinhoamigoindaiatuba",
    Icone: IconTikTok,
    corIcone: "#111",
    corNumero: "#fe2c55",
    estilo: {
      border: "2px solid #111",
      background: "#fff",
      boxShadow: "inset 0 0 0 2px #25f4ee, 0 1px 2px rgba(0,0,0,.05)",
    },
  },
];

// 6 por página no desktop, 3 no mobile (como nos prints)
function useItensPorPagina(): number {
  const consulta = "(min-width: 768px)";
  const [desktop, setDesktop] = useState<boolean>(() =>
    typeof window === "undefined" ? true : window.matchMedia(consulta).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(consulta);
    const aoMudar = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mql.addEventListener("change", aoMudar);
    return () => mql.removeEventListener("change", aoMudar);
  }, []);

  return desktop ? 6 : 3;
}

export default function CampaignsNews() {
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const [pagina, setPagina] = useState<number>(1);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const porPagina = useItensPorPagina();

  useEffect(() => {
    let ativo = true;
    publicacoesApi
      .listarPublicadas()
      .then((dados) => {
        if (ativo) setPublicacoes(dados);
      })
      .catch((e: unknown) => {
        if (ativo) {
          setErro(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar as publicações."
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const combinaComFiltro = (p: Publicacao) =>
    filtro === "Todas" || p.categoria === categoriaDoFiltro[filtro];

  const campanhasVisiveis = publicacoes.filter(
    (p) =>
      p.categoria === "campanha" &&
      (p.destaque || p.urgente) &&
      combinaComFiltro(p)
  ).sort(
    (a, b) =>
      Number(b.urgente) - Number(a.urgente) ||
      Number(b.destaque) - Number(a.destaque) ||
      b.criadoEm.localeCompare(a.criadoEm)
  );
  const outras = publicacoes.filter(
    (p) =>
      !(p.categoria === "campanha" && (p.destaque || p.urgente)) &&
      combinaComFiltro(p)
  );

  const totalPaginas = Math.max(1, Math.ceil(outras.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = outras.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  const semNada = campanhasVisiveis.length === 0 && outras.length === 0;

  const pagBtn =
    "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition-colors";

  return (
    <>
      <PageHero
        titulo="Acompanhe as Novidades"
        descricao="Fique por dentro das campanhas de arrecadação, eventos beneficentes, histórias de resgates e notícias mais recentes da Focinho Amigo."
      />

      <section className="bg-white px-5 py-6 lg:px-14 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Filtros */}
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
            {filtros.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFiltro(f);
                  setPagina(1);
                }}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                  filtro === f
                    ? "border-marca bg-marca text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {semNada && (
            <p className="mt-10 text-center text-sm text-zinc-500">
              {carregando
                ? "Carregando publicações..."
                : erro || "Nenhuma publicação por enquanto."}
            </p>
          )}
          {erro && !semNada && (
            <p role="alert" className="mt-4 text-sm text-red-700">{erro}</p>
          )}

          {/* Campanhas cadastradas no banco são exibidas no carrossel. */}
          {campanhasVisiveis.length > 0 && (
            <div className="mt-6">
              <CampanhasCarrossel campanhas={campanhasVisiveis} variant="eventos" />
            </div>
          )}

          {/* Publicações */}
          {outras.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl font-extrabold text-zinc-800">Mais Publicações</h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visiveis.map((p) => (
                  <article key={p.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                    {p.imagem && (
                      <img
                        src={p.imagem}
                        alt=""
                        className="h-48 w-full object-cover md:h-52"
                      />
                    )}
                    <div className="p-5">
                      <span className="rounded bg-marca px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        {nomeCategoria[p.categoria]}
                      </span>
                      <h3 className="mt-3 text-lg font-bold leading-snug text-zinc-800">{p.titulo}</h3>
                      {p.autor && (
                        <p className="mt-1 text-xs text-zinc-500">Por {p.autor}</p>
                      )}
                      <p className="mt-1 text-xs text-zinc-400">
                        {formatarDataCurta(p.dataEventoCampanha)}
                      </p>
                      {p.localEventoCampanha && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {p.localEventoCampanha}
                        </p>
                      )}
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">
                        {resumoConteudo(p)}
                      </p>
                      <Link
                        to={`/campanhas-e-noticias/${p.id}`}
                        className="mt-3 inline-block text-sm font-bold text-marca hover:underline"
                      >
                        Saiba mais
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Paginação */}
              <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={paginaAtual === 1}
                  onClick={() => setPagina(paginaAtual - 1)}
                  className={`${pagBtn} bg-slate-200 text-zinc-700 hover:bg-slate-300 disabled:opacity-50`}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-current={n === paginaAtual ? "page" : undefined}
                    onClick={() => setPagina(n)}
                    className={`${pagBtn} ${
                      n === paginaAtual
                        ? "bg-marca text-white"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPagina(paginaAtual + 1)}
                  className={`${pagBtn} bg-marca text-white hover:opacity-90 disabled:opacity-50`}
                >
                  Próximo
                </button>
              </nav>
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          REDES SOCIAIS
      ====================================================== */}
      
      <section className="bg-[#f1f1f1] px-5 py-12 lg:px-14 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-extrabold text-zinc-800 md:text-3xl">Siga-nos nas Redes Sociais</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Acompanhe nosso trabalho e compartilhe amor! Veja resgates em tempo real.
          </p>
          <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3 md:gap-5">
            {redes.map(({ nome, seguidores, href, Icone, corIcone, corNumero, estilo }) => {
              const [numero, ...resto] = seguidores.split(" ");
              return (
                <a
                  key={nome}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={estilo}
                  className="flex flex-col items-center rounded-xl px-2 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:py-6"
                >
                  <span className="flex" style={{ color: corIcone }}>
                    <Icone className="h-7 w-7 md:h-9 md:w-9" />
                  </span>
                  <strong className="mt-2 text-sm text-zinc-900">{nome}</strong>
                  <span className="mt-0.5 text-[11px] text-zinc-400">
                    <b style={{ color: corNumero }}>{numero}</b> {resto.join(" ")}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}