import type { JSX } from "react";
import { Link } from "react-router-dom";
import type { Pet } from "../../types/pet";

interface AnimalCardProps {
  animal: Pet;
  variant?: "home" | "adocao" | "outro";
  onConhecer?: (animal: Pet) => void;
}

/** Normaliza o sexo do animal para "F" ou "M", independente do formato vindo da API. */
function normalizarSexo(sexo?: string | null): "F" | "M" | null {
  if (!sexo) return null;
  const valor = String(sexo)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  
  if (["f", "femea", "female"].includes(valor)) return "F";
  if (["m", "macho", "male"].includes(valor)) return "M";
  
  return null;
}

export default function AnimalCard({
  animal,
  variant = "home",
  onConhecer,
}: AnimalCardProps): JSX.Element {
  const isHome = variant === "home";
  const sexoNormalizado = normalizarSexo(animal.sexo);

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        isHome ? "animal-card--home" : "animal-card--adocao"
      }`}
    >
      {/* Imagem */}
      <div className="relative shrink-0">
        <img
          src={animal.imagem}
          alt={`Foto de ${animal.nome}`}
          className={`w-full object-cover ${isHome ? "h-48" : "h-48"}`}
        />
      </div>

      {/* Informações do animal */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-800">{animal.nome}</h3>
            {/* Tag do tipo (Cão/Gato) - igual à imagem */}
            {animal.tipo && (
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                {animal.tipo}
              </span>
            )}
          </div>

          {/* SÍMBOLO DE GÊNERO - sempre visível fora da home */}
          {!isHome && sexoNormalizado && (
            <span
              role="img"
              aria-label={sexoNormalizado === "F" ? "Fêmea" : "Macho"}
              title={sexoNormalizado === "F" ? "Fêmea" : "Macho"}
              className={`text-2xl font-black leading-none ${
                sexoNormalizado === "F" ? "text-[#e83f5b]" : "text-marca"
              }`}
            >
              {sexoNormalizado === "F" ? "♀" : "♂"}
            </span>
          )}
        </div>

        {/* Tags: idade, porte, etc. */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-600">
            {animal.idade ||
              (animal.anos != null
                ? `${animal.anos} ${animal.anos === 1 ? "ano" : "anos"}`
                : "Idade não informada")}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-600">
            Porte {animal.porte || "Não informado"}
          </span>
        </div>

        {!isHome && (
          <p className="mt-3 flex-1 text-xs leading-5 text-zinc-500 line-clamp-3">
            {animal.descricao}
          </p>
        )}

        {onConhecer ? (
          <button
            type="button"
            onClick={() => onConhecer(animal)}
            className="mt-4 block w-full rounded-lg bg-marca px-4 py-2.5 text-center text-xs font-bold text-white transition hover:opacity-90"
          >
            Conhecer {animal.nome}
          </button>
        ) : (
          <Link
            to={`/adocao?animal=${animal.id}`}
            className="mt-4 block rounded-lg bg-marca px-4 py-2.5 text-center text-xs font-bold text-white transition hover:opacity-90"
          >
            Conhecer {animal.nome}
          </Link>
        )}
      </div>
    </article>
  );
}