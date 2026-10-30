import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import AnimalCard from "../../../components/layout/AnimalCard";
import PageHero from "../../../components/layout/PageHero";

import type { Pet } from "../../../types/pet";
import { useAnimaisDisponiveis } from "../../../hooks/useAnimaisDisponiveis";

// Benefícios do apadrinhamento
const beneficios = [
  "Segurança financeira para tratamentos longos",
  "Amor à distância com visitas programadas",
  "Oportunidade de fazer a diferença sem espaço físico",
];

// Plano de apadrinhamento
const plano = {
  nome: "Amigo",
  valor: "25",
  itens: [
    "Alimentação",
    "Tratamentos",
    "Atualizações periódicas de bem-estar",
  ],
};

/** Depoimento de um padrinho ou madrinha. */
interface Depoimento {
  nome: string;
  relacao: string;
  texto: string;
  foto: string;
}

const depoimentos: Depoimento[] = [
  {
    nome: "Cláudia Ribeiro",
    relacao: "Madrinha do Pirata há 1 ano",
    texto:
      "“Apadrinhar o Pirata foi a forma que encontrei de dar amor e suporte a um peludo necessitado mesmo não tendo espaço em casa. Fico extremamente feliz ao ver o Pirata correndo e recebendo o carinho dos cuidadores com a minha ajuda mensal.”",
    foto: "/images/pessoas/claudia-ribeiro.png",
  },
];

function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0 text-marca"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

const ITENS_POR_PAGINA = 3;

export default function Sponsorship() {
  // Rola até o #trecho da URL (ex.: /apadrinhamento#planos)
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  const { animais, carregando, erro } = useAnimaisDisponiveis();

  // Filtra prioritários (topo do Pet ou dentro de detalhes)
  const petsPrioritarios = animais.filter(
    (pet: Pet) =>
      pet.prioridadeApadrinhamento === true ||
      pet.detalhes?.prioridadeApadrinhamento === true
  );

  // Paginação
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(
    1,
    Math.ceil(petsPrioritarios.length / ITENS_POR_PAGINA)
  );

  const inicio = (pagina - 1) * ITENS_POR_PAGINA;
  const petsDaPagina = petsPrioritarios.slice(inicio, inicio + ITENS_POR_PAGINA);

  // Se o filtro mudar (ex.: admin alterou status), volta pra página 1
  useEffect(() => {
    setPagina(1);
  }, [petsPrioritarios.length]);

  function irParaPagina(novaPagina: number) {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    setPagina(novaPagina);
    document
      .getElementById("peludinhos")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <PageHero
        titulo="Apadrinhe um Focinho"
        descricao="Transforme positivamente o tratamento e o dia de um animal sem poder trazê-lo para casa."
        imagem="/images/hero/heroSponsorship.png"
      >
        <a
          href="#planos"
          className="mt-5 hidden rounded-lg bg-marca px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 md:inline-block"
        >
          Ver Planos de Apadrinhamento
        </a>
      </PageHero>

      {/* O QUE É O APADRINHAMENTO */}
      <section className="bg-white px-5 py-10 lg:px-14 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-zinc-800 md:text-3xl">
            O que é o Apadrinhamento?
          </h2>

          <p className="mt-2 hidden text-sm text-zinc-500 md:block">
            Uma forma solidária de acolher e sustentar o tratamento de resgatados.
          </p>

          <div className="mt-6 grid gap-8 md:grid-cols-[1.7fr_1fr] md:items-start md:gap-10">
            <div className="flex flex-col gap-5 text-sm leading-7 text-zinc-500">
              <p>
                Muitos animais que estão em nosso abrigo têm histórias
                complexas: são idosos demais, possuem doenças crônicas ou estão
                se recuperando de acidentes graves. Devido a esses cuidados
                especiais, eles costumam demorar muito mais tempo para
                encontrar um lar definitivo.
              </p>

              <p>
                Ao se tornar padrinho ou madrinha, você assume uma contribuição
                financeira mensal que garante ração de qualidade, medicamentos
                contínuos e atendimento veterinário dedicado àquele animal
                específico
                <span className="hidden md:inline">
                  , acompanhando toda a sua jornada de recuperação
                </span>
                .
              </p>
            </div>

            <aside className="rounded-2xl bg-sky-100 p-6">
              <h3 className="text-lg font-bold text-marca">
                Por que apadrinhar?
              </h3>

              <ul className="mt-3 flex flex-col gap-2 text-xs leading-5 text-zinc-800 md:text-[13px]">
                {beneficios.map((beneficio) => (
                  <li key={beneficio}>• {beneficio}</li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section
        id="planos"
        className="scroll-mt-4 bg-[#f1f1f1] px-5 py-12 lg:px-14 lg:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-zinc-800 md:text-center md:text-3xl">
            <span className="md:hidden">Planos de Apadrinhamento</span>
            <span className="hidden md:inline">Apadrinhe um Focinho</span>
          </h2>

          <p className="mt-2 text-sm text-zinc-500 md:text-center">
            Planos mensais estruturados para amparar diferentes perfis de resgatados.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <h3 className="text-xl font-bold text-marca">
              <span className="md:hidden">Plano </span>
              {plano.nome}
            </h3>

            <p className="text-xs text-zinc-500 md:text-sm">A partir de</p>

            <p className="mt-5 flex items-baseline gap-1">
              <strong className="text-4xl font-extrabold text-zinc-900">
                R$ {plano.valor}
              </strong>

              <span className="text-xs text-zinc-500">/mês</span>
            </p>

            <hr className="my-5 border-zinc-200" />

            <ul className="flex flex-col gap-2.5 text-xs text-zinc-700 md:text-[13px]">
              {plano.itens.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/como-ajudar"
              className="mt-6 block rounded-lg bg-destaque px-5 py-3 text-center text-sm font-bold text-zinc-900 transition-colors hover:bg-destaque-escura"
            >
              Apadrinhar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* PELUDINHOS QUE MAIS PRECISAM */}
      <section
        id="peludinhos"
        className="scroll-mt-4 bg-white px-5 py-12 lg:px-14 lg:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold text-zinc-800 md:text-center md:text-3xl">
            Peludinhos que mais precisam
          </h2>

          <p className="mt-2 text-sm text-zinc-500 md:text-center">
            Eles necessitam de cuidados contínuos de saúde e buscam padrinhos
            ansiosamente.
          </p>

          {carregando ? (
            <p className="mt-8 text-center text-sm text-zinc-500">
              Carregando animais...
            </p>
          ) : erro ? (
            <p role="alert" className="mt-8 text-center text-sm text-red-700">
              Não foi possível carregar os animais: {erro}
            </p>
          ) : petsPrioritarios.length > 0 ? (
            <>
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {petsDaPagina.map((pet: Pet) => (
                  <div key={pet.id ?? pet.nome} className="relative">
                    <AnimalCard animal={pet} variant="outro" />
                  </div>
                ))}
              </div>

              {/* Paginação (só aparece se houver mais de 1 página) */}
              {totalPaginas > 1 && (
                <nav
                  aria-label="Paginação de animais para apadrinhamento"
                  className="mt-8 flex flex-wrap items-center justify-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => irParaPagina(pagina - 1)}
                    disabled={pagina === 1}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Anterior
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => irParaPagina(n)}
                        aria-current={pagina === n ? "page" : undefined}
                        className={`h-9 w-9 rounded-lg text-sm font-bold transition ${
                          pagina === n
                            ? "bg-marca text-white"
                            : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => irParaPagina(pagina + 1)}
                    disabled={pagina === totalPaginas}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Próxima →
                  </button>
                </nav>
              )}
            </>
          ) : (
            <p className="mt-8 text-center text-sm text-zinc-500">
              No momento, não há animais prioritários cadastrados para
              apadrinhamento.
            </p>
          )}
        </div>
      </section>

      {/* VOZ DOS PADRINHOS */}
      <section className="bg-[#f1f1f1] px-5 py-12 lg:px-14 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-extrabold text-zinc-800 md:text-3xl">
            Voz dos Padrinhos
          </h2>

          <p className="mt-2 text-center text-sm text-zinc-500">
            A emoção de quem contribui para o reestabelecimento de vidas
            desamparadas.
          </p>

          <div className="mt-8 flex flex-col gap-5">
            {depoimentos.map((d: Depoimento) => (
              <article key={d.nome} className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm leading-6 text-zinc-800">{d.texto}</p>

                <div className="mt-5 flex items-center gap-3">
                  <img
                    src={d.foto}
                    alt={`Foto de ${d.nome}`}
                    className="h-11 w-11 rounded-full bg-zinc-200 object-cover"
                  />

                  <div>
                    <strong className="block text-sm text-zinc-900">{d.nome}</strong>
                    <span className="text-xs text-zinc-500">{d.relacao}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}