import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconChevronLeft, IconChevronRight } from "./Icons";
import type { Publicacao } from "../../services/publicacoesApi";
import { formatarDataCurta, nomeCategoria, resumoConteudo } from "../../lib/publicacoesUtils";

interface CampanhasCarrosselProps {
  campanhas: Publicacao[];
  variant?: "home" | "eventos";
  intervalo?: number;
}

export default function CampanhasCarrossel({
  campanhas,
  variant = "eventos",
  intervalo = 6000,
}: CampanhasCarrosselProps) {
  const campanhasFiltradas = campanhas.filter((c) => c.urgente || c.destaque);

  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = campanhasFiltradas.length;

  // Clampa o índice se a lista filtrada mudar de tamanho
  const posicao = total === 0 ? 0 : Math.min(indice, total - 1);

  useEffect(() => {
    if (total <= 1 || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndice((i) => (Math.min(i, total - 1) + 1) % total);
    }, intervalo);

    return () => window.clearInterval(timer);
  }, [total, pausado, intervalo]); // ← removido `indice` das deps (evita reset a cada clique)

  if (total === 0) return null;

  const home = variant === "home";
  const mover = (delta: number) => setIndice((posicao + delta + total) % total);
  const girando = total > 1 && !pausado;

  return (
    <div
      aria-roledescription="carousel"
      aria-live={girando ? "off" : "polite"}
      className="grid w-full"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPausado(true)}
      onPointerLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPausado(false);
      }}
    >
      {campanhasFiltradas.map((c, i) => {
        const ativo = i === posicao;
        const cores = home
          ? c.urgente
            ? "border border-destaque bg-[#fffdf3]"
            : "border border-zinc-900 bg-white"
          : c.urgente
            ? "border-2 border-destaque bg-white"
            : "border-2 border-zinc-900 bg-white";

        const formato = home
          ? "overflow-hidden rounded-2xl"
          : "gap-4 rounded-2xl p-4 sm:gap-5 sm:rounded-3xl md:grid-cols-[minmax(0,300px)_1fr] md:items-center md:gap-6 md:p-6 lg:grid-cols-[minmax(0,350px)_1fr] lg:gap-8 lg:p-8";

        return (
          <article
            key={c.id}
            aria-hidden={!ativo}
            className={`col-start-1 row-start-1 grid min-w-0 transition-[opacity,visibility] duration-500 motion-reduce:transition-none ${formato} ${cores} ${
              ativo ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
            }`}
          >
            {c.imagem && (
              <img
                src={c.imagem}
                alt={c.titulo}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className={
                  home
                    ? "h-44 w-full object-cover sm:h-52 md:h-full md:min-h-[220px] lg:min-h-[240px]"
                    : "h-44 w-full rounded-xl object-cover sm:h-52 sm:rounded-2xl md:h-[240px] lg:h-[283px]"
                }
              />
            )}

            <div className={`flex min-w-0 flex-col ${home ? "p-4 sm:p-6 lg:p-8" : "md:min-h-[240px]"}`}>
              <div className="flex flex-1 flex-col justify-center">
                <span
                  className={`w-fit max-w-full rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                    c.urgente
                      ? "bg-destaque/30 text-amber-700"
                      : "bg-sky-100 text-marca"
                  }`}
                >
                  {c.urgente
                    ? "Campanha urgente"
                    : c.destaque
                      ? "Em destaque"
                      : nomeCategoria[c.categoria]}
                </span>

                <h2 className="mt-3 break-words text-xl font-extrabold leading-tight text-zinc-800 sm:text-2xl md:text-[24px] lg:text-[26px]">
                  <Link to={`/campanhas-e-noticias/${c.id}`} className="hover:underline">
                    {c.titulo}
                  </Link>
                </h2>

                {c.dataEventoCampanha && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatarDataCurta(c.dataEventoCampanha)}
                    {c.localEventoCampanha ? ` · ${c.localEventoCampanha}` : ""}
                  </p>
                )}
                {c.autor && (
                  <p className="mt-1 text-xs text-zinc-500">Por {c.autor}</p>
                )}
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600 sm:line-clamp-4 md:line-clamp-none">
                  {c.resumo || resumoConteudo(c)}
                </p>

                <Link
                  to={c.urlArrecadacao || `/campanhas-e-noticias/${c.id}`}
                  target={c.urlArrecadacao ? "_blank" : undefined}
                  rel={c.urlArrecadacao ? "noreferrer" : undefined}
                  className="mt-5 block w-full rounded-lg bg-marca px-6 py-3 text-center text-sm font-bold text-white transition hover:opacity-90 md:w-fit"
                >
                  {c.urlArrecadacao ? "Contribuir Agora" : "Saiba mais"}
                </Link>
              </div>

              {total > 1 && (
                <div className="mt-5 flex items-center justify-between gap-3">
                  {/* Dots — AGORA usando campanhasFiltradas */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {campanhasFiltradas.map((outra, j) => (
                      <button
                        key={outra.id}
                        type="button"
                        aria-label={`Ir para a campanha ${j + 1} de ${total}`}
                        aria-current={j === posicao}
                        onClick={() => setIndice(j)}
                        className={`h-2.5 rounded-full transition-all ${
                          j === posicao ? "w-6 bg-marca" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Setas — visíveis em TODOS os tamanhos (antes: hidden md:flex) */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      aria-label="Campanha anterior"
                      onClick={() => mover(-1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-zinc-700 hover:bg-slate-200 active:scale-95 sm:h-10 sm:w-10"
                    >
                      <IconChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Próxima campanha"
                      onClick={() => mover(1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-zinc-700 hover:bg-slate-200 active:scale-95 sm:h-10 sm:w-10"
                    >
                      <IconChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}