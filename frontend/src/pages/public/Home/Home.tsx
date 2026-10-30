import { useState } from "react";

import { Link } from "react-router-dom";
import { FaPaw, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

import type { ComponentType, JSX } from "react";
import {
  IconGift,
  IconHeart,
  IconHome,
  IconUsers,
  type IconProps,
} from "../../../components/layout/Icons";

import type { Pet } from "../../../types/pet";

import AnimalCard from "../../../components/layout/AnimalCard";
import CampanhasCarrossel from "../../../components/layout/CampanhasCarrossel";
import PageHero from "../../../components/layout/PageHero";
import NewsletterModal from "../../../components/newsletter/NewsletterModal";

import { useAnimaisDisponiveis } from "../../../hooks/useAnimaisDisponiveis";
import { useCampanhasDestaque } from "../../../hooks/usePublicacoes";

/** Tipo de item de forma de ajuda. */
interface FormaAjuda {
  titulo: string;
  texto: string;
  link: string;
  Icone: ComponentType<IconProps>;
  destaque: boolean;
}

/** Depoimento de quem adotou. */
interface Depoimento {
  nome: string;
  pet: string;
  texto: string;
  foto: string;
}

const depoimentos: Depoimento[] = [
  {
    nome: "Mariana Silva",
    pet: "Adotou a Amora",
    texto:
      "“A Amora mudou nossas vidas. Todo o processo de adoção da Focinho Amigo foi feito com muita transparência e respeito pelo bem-estar animal.”",
    foto: "src/assets/images/pessoas/mariana-silva.png",
  },
  {
    nome: "Rodrigo Costa",
    pet: "Adotou o Pipoca",
    texto:
      "“O Pipoca era super medroso quando chegou, mas com as instruções da ONG e muito amor, hoje ele corre feliz e confia em todo mundo.”",
    foto: "src/assets/images/pessoas/rodrigo-costa.png",
  },
];

const formasAjuda: FormaAjuda[] = [
  {
    titulo: "Adoção",
    texto:
      "Abra as portas da sua casa e mude para sempre o destino de um animal resgatado.",
    link: "/adocao",
    Icone: IconHome,
    destaque: false,
  },
  {
    titulo: "Apadrinhamento",
    texto:
      "Ajude com os custos de alimentação e tratamento médico de um cão ou gato sem adotá-lo.",
    link: "/apadrinhamento",
    Icone: IconHeart,
    destaque: false,
  },
  {
    titulo: "Voluntariado",
    texto:
      "Doe seu tempo e carinho participando de ações, banhos e feiras de adoção.",
    link: "/voluntariado",
    Icone: IconUsers,
    destaque: false,
  },
  {
    titulo: "Doação",
    texto:
      "Qualquer valor faz a diferença na compra de medicamentos, ração e manutenção do abrigo.",
    link: "/como-ajudar",
    Icone: IconGift,
    destaque: true,
  },
];

/** Página inicial pública com hero, pets, depoimentos e parceiros. */
export default function Home(): JSX.Element {
  const {
    animais: petsComImagem,
    carregando: carregandoAnimais,
    erro: erroAnimais,
  } = useAnimaisDisponiveis();

  // ↓↓↓ ADICIONAR ESTAS LINHAS ↓↓↓
  const {
    data: campanhasVisiveis = [],
    error: erroCampanhaApi,
  } = useCampanhasDestaque();

  const erroCampanha =
    erroCampanhaApi instanceof Error
      ? erroCampanhaApi.message
      : erroCampanhaApi
        ? "Não foi possível carregar a campanha."
        : "";
        
  const [newsletterSolicitada, setNewsletterSolicitada] = useState(false);


  return (
    <main>
      <NewsletterModal
        abrirSolicitado={newsletterSolicitada}
        aoFecharSolicitado={() => setNewsletterSolicitada(false)}
      />

      {/* O wrapper "relative" faz as redes sociais se ancorarem no canto do banner inteiro */}
      <div className="relative">
        <PageHero
          grande
          titulo={
            <>
              Cada focinho merece um <br /> lar cheio de amor
            </>
          }
          descricao="A Focinho Amigo resgata, cuida e encontra famílias definitivas para animais abandonados. Junte-se a nós nesta missão de salvar vidas."
          imagem="src/assets/images/hero/heroHome.png"
        >
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/adocao"
              className="rounded-lg bg-marca px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              Quero Adotar
            </Link>
            <Link
              to="/como-ajudar"
              className="rounded-lg bg-destaque px-5 py-3 text-sm font-bold text-zinc-900 transition hover:bg-destaque-escura"
            >
              Quero Ajudar
            </Link>
          </div>
        </PageHero>

        {/* Redes sociais no canto direito do banner (fora do PageHero) */}
        <div className="absolute bottom-8 right-6 z-20 flex flex-col gap-3 sm:right-9">
          <a
            href="https://www.instagram.com/focinhoamigoindaiatuba/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da Focinho Amigo"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg transition hover:scale-110 hover:bg-[#1264cc]"
          >
            <FaInstagram className="h-5 w-5" />
          </a>

          <a
            href="https://www.facebook.com/FocinhoAmigoIndaiatuba"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook da Focinho Amigo"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg transition hover:scale-110 hover:bg-[#1264cc]"
          >
            <FaFacebookF className="h-5 w-5" />
          </a>

          <a
            href="https://www.tiktok.com/@focinhoamigoindaiatuba"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok da Focinho Amigo"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg transition hover:scale-110 hover:bg-[#1264cc]"
          >
            <FaTiktok className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* =====================================================
          CAMPANHAS URGENTES E Outras PUBLICAÇÕES EM DESTAQUE
      ====================================================== */}
      {(campanhasVisiveis.length > 0 || erroCampanha) && (
        <section className="bg-white px-5 py-10 lg:px-14">
          <div className="mx-auto max-w-6xl">
            {erroCampanha ? (
              <p role="alert" className="text-sm text-red-700">
                Não foi possível carregar as campanhas: {erroCampanha}
              </p>
            ) : (
              <CampanhasCarrossel campanhas={campanhasVisiveis} variant="eventos" />
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          PETS
      ====================================================== */}
      {(carregandoAnimais || erroAnimais || petsComImagem.length > 0) && (
        <section className="bg-[#f1f1f1] px-5 py-16 lg:px-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-800">
                  Conheça nossos pets
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Eles estão à espera de uma família para chamar de sua.
                </p>
              </div>
              <Link
                to="/adocao"
                className="hidden text-xs font-semibold text-marca md:block"
              >
                Procure por espécie ↓
              </Link>
            </div>
            {carregandoAnimais ? (
              <p className="mt-8 text-sm text-zinc-500">Carregando animais...</p>
            ) : erroAnimais ? (
              <p role="alert" className="mt-8 text-sm text-red-700">
                Não foi possível carregar os animais: {erroAnimais}
              </p>
            ) : (
              <>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                  {petsComImagem.slice(0, 3).map((pet: Pet) => (
                    <AnimalCard key={pet.id} animal={pet} variant="home" />
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Link to="/adocao" className="text-xs font-bold text-marca">
                    Ver todos os animais →
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          SOBRE
      ====================================================== */}
      <section className="bg-white px-5 py-16 lg:px-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
          <img
            src="src/assets/images/equipe.png"
            alt="Equipe do Focinho Amigo com animais resgatados"
            className="h-[320px] w-full rounded-2xl object-cover"
          />
          <div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase text-marca">
              Quem somos
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-zinc-800">
              O trabalho por trás de cada recomeço feliz
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Fundada em 2018, a Focinho Amigo nasceu do sonho de mudar a realidade
              de cães e gatos desamparados no Brasil.
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Oferecemos atendimento veterinário de qualidade, abrigo seguro,
              alimentação, apoio psicológico e, acima de tudo, o encaminhamento
              responsável para lares acolhedores.
            </p>
            <Link
              to="/sobre-nos"
              className="mt-5 inline-block rounded-lg bg-marca px-5 py-3 text-xs font-bold text-white"
            >
              Conheça nossa história
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          NÚMEROS
      ====================================================== */}
      <section className="bg-marca px-5 py-10 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          <div>
            <strong className="text-3xl font-extrabold text-destaque">
              +500
            </strong>
            <p className="mt-1 text-xs">Animais Resgatados</p>
          </div>
          <div>
            <strong className="text-3xl font-extrabold text-destaque">
              +350
            </strong>
            <p className="mt-1 text-xs">Adoções Realizadas</p>
          </div>
          <div>
            <strong className="text-3xl font-extrabold text-destaque">
              +120
            </strong>
            <p className="mt-1 text-xs">Voluntários Ativos</p>
          </div>
          <div>
            <strong className="text-3xl font-extrabold text-destaque">
              +80
            </strong>
            <p className="mt-1 text-xs">Apadrinhamentos</p>
          </div>
        </div>
      </section>

      {/* =====================================================
          DEPOIMENTOS
      ====================================================== */}
      <section className="bg-[#f1f1f1] px-5 py-16 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-zinc-800">
              Histórias de Quem Adotou
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              A maior recompensa para o nosso coração é ver as famílias se
              completando.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {depoimentos.map((d: Depoimento) => (
              <article key={d.nome} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-destaque">★★★★★</div>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{d.texto}</p>
                <div className="mt-5 flex items-center gap-3">
                  <img
                    src={d.foto}
                    alt={`Foto de ${d.nome}`}
                    className="h-9 w-9 rounded-full bg-zinc-200 object-cover"
                  />
                  <div>
                    <strong className="block text-xs text-zinc-800">{d.nome}</strong>
                    <span className="text-[10px] text-zinc-500">{d.pet}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          COMO AJUDAR
      ====================================================== */}
      <section className="bg-white px-5 py-16 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-extrabold text-zinc-800">
            Como Você Pode Ajudar
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Existem várias formas de transformar a vida dos nossos resgatados.
            Escolha a que mais toca seu coração.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {formasAjuda.map((item: FormaAjuda) => (
              <article
                key={item.titulo}
                className="rounded-2xl bg-[#f1f1f1] p-5 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    item.destaque
                      ? "bg-destaque text-zinc-900"
                      : "bg-marca text-white"
                  }`}
                >
                  <item.Icone className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-zinc-800">{item.titulo}</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {item.texto}
                </p>
                <Link
                  to={item.link}
                  className="mt-4 inline-block text-[10px] font-bold text-marca"
                >
                  Saiba Mais →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          NEWSLETTER
      ====================================================== */}
      <section className="bg-[#f1f1f1] px-5 py-12 lg:px-14">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-3xl bg-marca px-6 py-10 text-center text-white shadow-sm sm:px-10 md:flex-row md:justify-between md:gap-8 md:px-12 md:py-12 md:text-left">
          <FaPaw
            aria-hidden="true"
            className="pointer-events-none absolute -right-5 -top-8 h-36 w-36 rotate-[-18deg] text-white/10"
          />
          <div className="relative flex max-w-2xl items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-destaque sm:flex">
              <FiMail aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-destaque">
                Fique por dentro
              </p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
                Novidades que aquecem o coração
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/85">
                Receba notícias dos nossos focinhos
                diretamente no seu e-mail.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNewsletterSolicitada(true)}
            className="relative inline-flex min-h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-destaque px-6 py-3 text-sm font-extrabold text-zinc-900 transition-colors hover:bg-destaque-escura sm:w-auto"
          >
            <FiMail aria-hidden="true" className="h-4 w-4" />
            Quero receber novidades
          </button>
        </div>
      </section>

      {/* =====================================================
          PARCEIROS
      ====================================================== */}
      <section className="bg-[#f1f1f1] px-5 py-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            Nossos parceiros & apoiadores
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
            {[
              "VetCare",
              "PetShop Petz",
              "Amor Animal",
              "NutriPet",
              "DogRoom",
              "PataSegura",
            ].map((parceiro) => (
              <div
                key={parceiro}
                className="flex h-10 items-center justify-center rounded-lg bg-white px-3 text-[10px] font-semibold text-zinc-400"
              >
                ♢ {parceiro}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}