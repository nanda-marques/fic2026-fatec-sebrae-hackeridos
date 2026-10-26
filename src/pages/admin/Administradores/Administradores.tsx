import { useCallback, useEffect, useState } from "react";
import {
  LuUsers,
  LuClock,
  LuCheck,
  LuX,
  LuRefreshCw,
  LuShieldCheck,
  LuHistory,
} from "react-icons/lu";

import {
  adminApi,
  type CadastroPendente,
  type SolicitacaoAnalisada,
} from "../../../services/adminApi";

export default function Administradores(): React.JSX.Element {
  const [cadastros, setCadastros] = useState<CadastroPendente[]>([]);
  const [historico, setHistorico] = useState<SolicitacaoAnalisada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregarDados = useCallback(async (): Promise<void> => {
    setCarregando(true);
    setErro("");

    try {
      const [pendentes, analisadas] = await Promise.all([
        adminApi.listarPendentes(),
        adminApi.listarHistoricoSolicitacoes(),
      ]);

      setCadastros(pendentes);
      setHistorico(analisadas);
    } catch (error: unknown) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as solicitações.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  async function decidirCadastro(
    cadastro: CadastroPendente,
    decisao: "aprovar" | "rejeitar",
  ): Promise<void> {
    const acao = decisao === "aprovar" ? "aprovar" : "rejeitar";

    const confirmado = window.confirm(
      `Tem certeza de que deseja ${acao} o cadastro de ${cadastro.nomeCompleto}?`,
    );

    if (!confirmado) return;

    setProcessando(cadastro.id);
    setErro("");
    setMensagem("");

    try {
      if (decisao === "aprovar") {
        await adminApi.aprovarCadastro(cadastro.id);
        setMensagem(
          `O cadastro de ${cadastro.nomeCompleto} foi aprovado com sucesso.`,
        );
      } else {
        await adminApi.rejeitarCadastro(cadastro.id);
        setMensagem(
          `O cadastro de ${cadastro.nomeCompleto} foi rejeitado.`,
        );
      }

      await carregarDados();
    } catch (error: unknown) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível processar esse cadastro.",
      );
    } finally {
      setProcessando(null);
    }
  }

  function formatarData(data: string): string {
    if (!data) return "Data não informada";

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
      return "Data não informada";
    }

    return dataConvertida.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <main className="min-h-screen bg-[#f5f6fa] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#2174b7]">
              <LuShieldCheck className="h-4 w-4" />
              Administração do sistema
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#263445]">
              Gerenciar administradores
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Analise os cadastros recebidos e decida quem poderá acessar o
              painel administrativo do Focinho Amigo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void carregarDados()}
            disabled={carregando}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
          >
            <LuRefreshCw
              className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`}
            />
            Atualizar lista
          </button>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <LuClock className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Cadastros aguardando análise
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#263445]">
                {cadastros.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2174b7]">
              <LuUsers className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Situação dos novos acessos
              </p>
              <p className="mt-1 text-sm font-bold text-[#263445]">
                Aprovação manual
              </p>
            </div>
          </div>
        </section>

        {mensagem && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
          >
            {mensagem}
          </div>
        )}

        {erro && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <p className="font-semibold">
              Não foi possível concluir a operação.
            </p>
            <p className="mt-1">{erro}</p>
          </div>
        )}

        <section className="mb-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-[#263445]">
                Solicitações de acesso
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Confira os dados antes de tomar uma decisão.
              </p>
            </div>

            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              {cadastros.length} pendente{cadastros.length === 1 ? "" : "s"}
            </span>
          </div>

          {carregando ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <LuRefreshCw className="mb-3 h-7 w-7 animate-spin text-[#2174b7]" />
              <p className="text-sm text-gray-500">
                Carregando solicitações...
              </p>
            </div>
          ) : cadastros.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                <LuCheck className="h-7 w-7" />
              </div>

              <h3 className="font-bold text-[#263445]">Tudo em dia!</h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Não há cadastros aguardando aprovação no momento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cadastros.map((cadastro) => (
                <article
                  key={cadastro.id}
                  className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words font-bold text-[#263445]">
                        {cadastro.nomeCompleto}
                      </h3>

                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Pendente
                      </span>
                    </div>

                    <p className="mt-1 break-all text-sm text-gray-500">
                      {cadastro.email}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                      <span>
                        <span className="font-semibold text-gray-600">
                          Cargo:
                        </span>{" "}
                        {cadastro.cargo || "Não informado"}
                      </span>

                      <span>
                        <span className="font-semibold text-gray-600">
                          Solicitação:
                        </span>{" "}
                        {cadastro.criadoEm
                          ? new Date(cadastro.criadoEm).toLocaleDateString(
                              "pt-BR",
                            )
                          : "Data não informada"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                    <button
                      type="button"
                      onClick={() => void decidirCadastro(cadastro, "aprovar")}
                      disabled={processando !== null || carregando}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LuCheck className="h-4 w-4" />
                      {processando === cadastro.id
                        ? "Processando..."
                        : "Aprovar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void decidirCadastro(cadastro, "rejeitar")}
                      disabled={processando !== null || carregando}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LuX className="h-4 w-4" />
                      Rejeitar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2174b7]">
                <LuHistory className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-[#263445]">
                  Últimas 5 solicitações analisadas
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Histórico de aprovações e rejeições.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
              {historico.length} de 5
            </span>
          </div>

          {carregando ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              Carregando histórico...
            </div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
              <LuHistory className="mb-3 h-7 w-7 text-gray-300" />
              <p className="font-semibold text-[#263445]">
                Nenhuma decisão registrada ainda
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                As próximas aprovações e rejeições aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {historico.map((item) => {
                const aprovado = item.decisao === "aprovado";

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-3 px-5 py-5 sm:px-6 md:flex-row md:items-start md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-bold text-[#263445]">
                          {item.solicitanteNome}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                            aprovado
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {aprovado ? (
                            <LuCheck className="h-3.5 w-3.5" />
                          ) : (
                            <LuX className="h-3.5 w-3.5" />
                          )}
                          {aprovado ? "Aprovado" : "Rejeitado"}
                        </span>
                      </div>

                      <p className="mt-1 break-all text-sm text-gray-500">
                        {item.solicitanteEmail}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                        <span>
                          <span className="font-semibold text-gray-600">
                            Cargo solicitado:
                          </span>{" "}
                          {item.cargoSolicitado}
                        </span>

                        <span>
                          <span className="font-semibold text-gray-600">
                            Analisado por:
                          </span>{" "}
                          {item.administradorNome}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs text-gray-500 md:pt-1">
                      <LuClock className="h-4 w-4" />
                      <span>{formatarData(item.decididoEm)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-gray-400">
          Somente usuários autorizados podem gerenciar solicitações. Novos
          cadastros permanecem bloqueados até a aprovação.
        </p>
      </div>
    </main>
  );
}