import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { LuUpload, LuPencil, LuTrash2, LuX } from "react-icons/lu";

import type { Animal, NovoAnimal } from "../../../services/animaisApi";
import { imagemDoAnimal } from "../../../lib/animalFallback";

import AdminHeader from "../../../components/layout/adminHeader";
import {
  useAnimais,
  useAtualizarAnimal,
  useCriarAnimal,
  useExcluirAnimal,
  useImportarCSVAnimais,
  useUploadImagemAnimal,
} from "../../../hooks/useAnimais";

type TipoMensagem = "erro" | "sucesso" | "";
interface Mensagem {
  tipo: TipoMensagem;
  texto: string;
}

type FormAnimal = Omit<NovoAnimal, "idade" | "peso"> & {
  idade: string;
  peso: string;
};

const FORM_INICIAL: FormAnimal = {
  nome: "",
  especie: "",
  status: "Disponível",
  idade: "",
  imagem: null,
  porte: "",
  raca: "",
  peso: "",
  castracao: "",
  vacinacaoEmDia: false,
  temperamento: "",
  sobre: "",
  dispararNewsletter: false,
};

export default function Animais() {
  const imagemInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // React Query
  const { data: animais = [], isLoading } = useAnimais();
  const criarAnimal = useCriarAnimal();
  const atualizarAnimal = useAtualizarAnimal();
  const excluirAnimal = useExcluirAnimal();
  const uploadImagem = useUploadImagemAnimal();
  const importarCSV = useImportarCSVAnimais();

  const salvando = criarAnimal.isPending || atualizarAnimal.isPending;
  const enviandoImagem = uploadImagem.isPending;

  // Estado de UI (não de servidor)
  const [mensagem, setMensagem] = useState<Mensagem>({ tipo: "", texto: "" });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormAnimal>(FORM_INICIAL);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; 
    if (!arquivo) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      setMensagem({
        tipo: "erro",
        texto: "Selecione uma imagem JPG, PNG ou WebP.",
      });
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setMensagem({ tipo: "erro", texto: "A imagem deve ter no máximo 5 MB." });
      return;
    }

    setMensagem({ tipo: "", texto: "" });
    try {
      const { url } = await uploadImagem.mutateAsync(arquivo);
      setForm((prev) => ({ ...prev, imagem: url }));
    } catch (erro: unknown) {
      setMensagem({
        tipo: "erro",
        texto:
          erro instanceof Error
            ? erro.message
            : "Não foi possível enviar a imagem.",
      });
    }
  }

  function iniciarEdicao(animal: Animal) {
    setEditandoId(animal.id);
    setForm({
      nome: animal.nome ?? "",
      especie: animal.especie ?? "",
      status: animal.status ?? "Disponível",
      idade: animal.idade == null ? "" : String(animal.idade),
      imagem: animal.imagem,
      porte: animal.porte ?? "",
      raca: animal.raca ?? "",
      peso: animal.peso == null ? "" : String(animal.peso),
      castracao: animal.castracao ?? "",
      vacinacaoEmDia: animal.vacinacaoEmDia ?? false,
      temperamento: animal.temperamento ?? "",
      sobre: animal.sobre ?? "",
      dispararNewsletter: animal.dispararNewsletter ?? false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.nome.trim()) {
      setMensagem({
        tipo: "erro",
        texto: "Por favor, preencha o nome do animal.",
      });
      return;
    }

    setMensagem({ tipo: "", texto: "" });

    try {
      const dados: NovoAnimal = {
        ...form,
        idade: form.idade.trim() ? Number(form.idade) : null,
        peso: form.peso.trim() ? Number(form.peso.replace(",", ".")) : null,
      };
      if (editandoId !== null) {
        await atualizarAnimal.mutateAsync({ id: editandoId, dados });
        setMensagem({
          tipo: "sucesso",
          texto: "Animal atualizado com sucesso!",
        });
      } else {
        await criarAnimal.mutateAsync(dados);
        setMensagem({
          tipo: "sucesso",
          texto: "Animal cadastrado com sucesso!",
        });
      }

      cancelarEdicao();
    } catch (err: unknown) {
      setMensagem({
        tipo: "erro",
        texto:
          err instanceof Error
            ? err.message
            : "Erro ao salvar os dados do animal.",
      });
    }
  }

  async function handleExcluir(animal: Animal) {
    const confirmou = window.confirm(
      `Deseja realmente excluir "${animal.nome}"?`
    );
    if (!confirmou) return;

    try {
      await excluirAnimal.mutateAsync(animal.id);
      setMensagem({
        tipo: "sucesso",
        texto: `"${animal.nome}" foi removido com sucesso.`,
      });

      if (editandoId === animal.id) cancelarEdicao();
    } catch (err: unknown) {
      setMensagem({
        tipo: "erro",
        texto:
          err instanceof Error
            ? err.message
            : "Não foi possível excluir o animal.",
      });
    }
  }

  async function handleImportarCSV(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importarCSV.mutateAsync(file);
      setMensagem({ tipo: "sucesso", texto: "CSV importado com sucesso!" });
    } catch (err: unknown) {
      setMensagem({
        tipo: "erro",
        texto:
          err instanceof Error
            ? err.message
            : "Erro ao importar o arquivo CSV.",
      });
    } finally {
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  }

  function getStatusBadgeClass(status: string) {
    const val = status.toLocaleLowerCase("pt-BR");
    if (val === "disponível")
      return "bg-emerald-100 text-emerald-700 font-bold";
    if (val === "adotado")
      return "bg-slate-100 text-slate-600 font-bold";
    return "bg-amber-100 text-amber-700 font-bold";
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-['Inter',sans-serif] text-[#1f2937]">
      <AdminHeader titulo="Animais" />

      <main className="mx-auto max-w-[1400px] space-y-8 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#111827]">
            {editandoId !== null ? "Editar Animal" : "Cadastro de Animais"}
          </h2>

          <input
            type="file"
            ref={csvInputRef}
            onChange={handleImportarCSV}
            accept=".csv"
            className="hidden"
          />
          <button
            type="button"
            disabled={importarCSV.isPending}
            onClick={() => csvInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1d70b8] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#155a96] disabled:opacity-50"
          >
            <LuUpload size={18} />
            {importarCSV.isPending ? "Importando CSV..." : "Importar CSV"}
          </button>
        </div>

        {mensagem.texto && (
          <div
            className={`rounded-lg p-4 text-sm font-semibold ${
              mensagem.tipo === "erro"
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-[#111827]">
              {editandoId !== null ? "Editar Ficha do Animal" : "Ficha"}
            </h3>

            {editandoId !== null && (
              <button
                type="button"
                disabled={salvando || enviandoImagem}
                onClick={cancelarEdicao}
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                <LuX size={16} /> Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-[#374151]">
                Imagem
              </label>
              <input
                ref={imagemInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImagemChange}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-3">
                {form.imagem && (
                  <img
                    src={form.imagem}
                    alt="Prévia da imagem do animal"
                    className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                  />
                )}
                <button
                  type="button"
                  disabled={salvando || enviandoImagem}
                  onClick={() => imagemInputRef.current?.click()}
                  className="inline-flex h-[46px] items-center gap-2 rounded-lg border border-slate-200 bg-[#f9fafb] px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  <LuUpload size={18} />
                  {enviandoImagem
                    ? "Enviando imagem..."
                    : form.imagem
                      ? "Substituir imagem"
                      : "Selecionar imagem"}
                </button>
                {form.imagem && (
                  <button
                    type="button"
                    disabled={salvando || enviandoImagem}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, imagem: null }))
                    }
                    className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Remover imagem
                  </button>
                )}
                <span className="text-xs text-slate-500">
                  JPG, PNG ou WebP; até 5 MB.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Campo
                label="Nome do animal"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                placeholder="Ex.: Bela"
              />
              <Select
                label="Espécie"
                name="especie"
                value={form.especie ?? ""}
                onChange={handleChange}
                required
                options={[
                  { value: "", label: "Selecione…" },
                  { value: "Canino", label: "Canino" },
                  { value: "Felino", label: "Felino" },
                ]}
              />
              <Select
                label="Castração"
                name="castracao"
                value={form.castracao ?? ""}
                onChange={handleChange}
                options={[
                  { value: "", label: "Não informado" },
                  { value: "Castrado", label: "Castrado(a)" },
                  { value: "Pendente", label: "Pendente" },
                  { value: "Agendada", label: "Agendada" },
                ]}
              />
              <label className="flex items-center gap-2 self-center text-sm font-semibold text-[#374151]">
                <input
                  type="checkbox"
                  checked={form.vacinacaoEmDia}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      vacinacaoEmDia: e.target.checked,
                    }))
                  }
                />
                Vacinação em dia
              </label>
              <Select
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={[
                  { value: "Disponível", label: "Disponível" },
                  { value: "Adotado", label: "Adotado" },
                  { value: "Em Processo", label: "Em Processo" },
                ]}
                required
              />
              <Campo
                label="Idade"
                name="idade"
                type="number"
                min="0"
                value={form.idade}
                onChange={handleChange}
                placeholder="Ex.: 2"
              />
              <Campo
                label="Raça"
                name="raca"
                value={form.raca ?? ""}
                onChange={handleChange}
                placeholder="Ex.: SRD"
              />
              <Campo
                label="Peso (kg)"
                name="peso"
                type="number"
                min="0"
                step="0.01"
                value={form.peso}
                onChange={handleChange}
                placeholder="Ex.: 4,5"
              />
              <Select
                label="Porte"
                name="porte"
                value={form.porte ?? ""}
                onChange={handleChange}
                options={[
                  { value: "", label: "Selecione…" },
                  { value: "Pequeno", label: "Pequeno" },
                  { value: "Médio", label: "Médio" },
                  { value: "Grande", label: "Grande" },
                ]}
                required  
              />
              <Campo
                label="Temperamento"
                name="temperamento"
                value={form.temperamento ?? ""}
                onChange={handleChange}
                placeholder="Ex.: Dócil"
              />
              <label className="flex items-center gap-2 self-center text-sm font-semibold text-[#374151]">
                <input
                  type="checkbox"
                  checked={form.dispararNewsletter}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      dispararNewsletter: e.target.checked,
                    }))
                  }
                />
                Incluir na newsletter
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-extrabold text-[#374151]">
                Sobre
              </span>
              <textarea
                name="sobre"
                value={form.sobre ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sobre: e.target.value }))
                }
                rows={4}
                className="w-full rounded-lg border border-slate-200 bg-[#f9fafb] px-4 py-2.5 text-sm outline-none transition focus:border-[#1d70b8] focus:bg-white"
              />
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={salvando || enviandoImagem}
                className="rounded-lg bg-[#1d70b8] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#155a96] disabled:opacity-50"
              >
                {enviandoImagem
                  ? "Enviando imagem..."
                  : salvando
                  ? "Salvando..."
                  : editandoId !== null
                  ? "Salvar Alterações"
                  : "Cadastrar"}
              </button>

              {editandoId !== null && (
                <button
                  type="button"
                  disabled={salvando || enviandoImagem}
                  onClick={cancelarEdicao}
                  className="rounded-lg bg-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-300"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-extrabold text-[#111827]">
            Animais cadastrados
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-100 bg-[#f9fafb] text-xs font-extrabold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Imagem</th>
                  <th className="px-5 py-3.5">Nome</th>
                  <th className="px-5 py-3.5">Espécie</th>
                  <th className="px-5 py-3.5">Raça</th>
                  <th className="px-5 py-3.5">Idade</th>
                  <th className="px-5 py-3.5">Peso</th>
                  <th className="px-5 py-3.5">Castração</th>
                  <th className="px-5 py-3.5">Vacinação</th>
                  <th className="px-5 py-3.5">Porte</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5 text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-500">
                      Carregando animais...
                    </td>
                  </tr>
                ) : animais.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-500">
                      Nenhum animal cadastrado.
                    </td>
                  </tr>
                ) : (
                  animais.map((animal) => (
                    <tr
                      key={animal.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-200 bg-[#f9fafb]">
                          <img
                            src={animal.imagem || imagemDoAnimal(animal.nome)}
                            alt={`Foto de ${animal.nome}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-[#111827]">
                        {animal.nome}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {animal.especie || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {animal.raca || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {animal.idade == null
                          ? "—"
                          : `${animal.idade} ${animal.idade === 1 ? "ano" : "anos"}`}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {animal.peso == null ? "—" : `${animal.peso} kg`}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {animal.castracao || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {animal.vacinacaoEmDia ? "Em dia" : "Pendente"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {animal.porte || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-md px-3 py-1 text-xs ${getStatusBadgeClass(animal.status)}`}
                        >
                          {animal.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {animal.criadoEm
                          ? new Date(animal.criadoEm).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Editar"
                            onClick={() => iniciarEdicao(animal)}
                            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#1d70b8]"
                          >
                            <LuPencil size={17} />
                          </button>
                          <button
                            type="button"
                            title="Excluir"
                            onClick={() => handleExcluir(animal)}
                            className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <LuTrash2 size={17} />
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
      </main>
    </div>
  );
}

// Campo
interface CampoProps {
  label: string;
  name: keyof FormAnimal;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: string;
  step?: string;
  required?: boolean;
}

function Campo({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
  required,
}: CampoProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold text-[#374151]">
        {label}
      </label>
      <input
        type={type}
        min={min}
        step={step}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required} 
        className="w-full rounded-lg border border-slate-200 bg-[#f9fafb] px-4 py-2.5 text-sm outline-none transition focus:border-[#1d70b8] focus:bg-white"
      />
    </div>
  );
}

// Select
interface SelectProps {
  label: string;
  name: keyof FormAnimal;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}

function Select({ label, name, value, onChange, options, required }: SelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold text-[#374151]">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full cursor-pointer rounded-lg border border-slate-200 bg-[#f9fafb] px-4 py-2.5 text-sm outline-none transition focus:border-[#1d70b8] focus:bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}