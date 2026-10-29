import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FiLock,
  FiArrowLeft,
  FiHeart,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { FaPaw } from "react-icons/fa";

import { authApi } from "../../../services/authApi";
import logo from "../../../assets/logo_pequena.svg";

export default function ResetarSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!token) {
      setErro(
        "Não encontramos o código de recuperação. Solicite um novo link para redefinir sua senha."
      );
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!token) {
      setErro("Link de recuperação inválido. Solicite um novo e-mail.");
      return;
    }

    if (senha.length < 8) {
      setErro("Sua nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmar) {
      setErro("As senhas digitadas não são iguais. Confira e tente novamente.");
      return;
    }

    setCarregando(true);

    try {
      await authApi.redefinirSenha(token, senha);
      setEnviado(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível redefinir sua senha. Solicite um novo link e tente novamente.";

      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[38.9%_61.1%] font-['Inter',Arial,sans-serif] text-[#202b3e] bg-[#f0f0f0] box-border *:box-border">
      <aside className="min-h-auto lg:min-h-screen py-[24px] px-[25px] sm:py-[36px] sm:px-[38px] lg:py-[40px] lg:px-[64px] flex flex-col justify-between text-white bg-[#2174b7]">
        <Link
          to="/"
          className="flex items-center gap-3 w-fit text-white no-underline"
          aria-label="Focinho Amigo"
        >
          <img
            src={logo}
            alt="Focinho Amigo"
            className="w-[54px] h-[49px] object-contain"
          />

          <span className="flex flex-col gap-[2px]">
            <strong className="text-[15px] font-extrabold">
              Focinho Amigo
            </strong>
            <small className="text-[#ffd21f] text-[11px] font-semibold">
              Painel Admin
            </small>
          </span>
        </Link>

        <section className="max-w-[405px] my-[24px] lg:my-auto">
          <h1 className="m-0 mb-[12px] text-[28px] sm:text-[32px] lg:text-[clamp(30px,2.5vw,36px)] leading-[1.2] tracking-[-1px] font-extrabold">
            Redefina sua senha
          </h1>

          <p className="max-w-[400px] m-0 text-[#e1edf9] text-[14px] lg:text-[15.5px] leading-[1.5]">
            Crie uma nova senha para voltar a acessar o painel administrativo.
          </p>
        </section>

        <footer className="flex items-center gap-3 text-[#b7d7f3] text-[12.5px]">
          <FiHeart className="w-[19px] h-[19px] shrink-0" />
          <span>Focinho Amigo ONG • Proteção Animal</span>
        </footer>
      </aside>

      <section className="min-h-auto lg:min-h-screen flex items-center justify-center py-[34px] px-[18px] sm:p-[32px] lg:p-[48px] bg-[#f0f0f0]">
        <div className="w-full max-w-[482px] p-[28px_19px] sm:p-[34px_30px] lg:p-[40px] bg-white border border-[#e2e2e2] rounded-[17px] shadow-[0_2px_3px_rgb(0_0_0/22%)]">
          <header className="mb-[31px] text-center">
            <div className="w-[56px] h-[56px] mx-auto mb-[12px] flex items-center justify-center text-[#0874ca] bg-[#e8f3fd] rounded-full">
              <FaPaw className="w-[29px] h-[29px]" />
            </div>

            <h2 className="m-0 mb-[12px] text-[#202b3e] text-[20px] sm:text-[22px] lg:text-[24px] leading-[1.25] tracking-[-0.55px] font-extrabold">
              {enviado ? "Senha atualizada!" : "Crie sua nova senha"}
            </h2>

            <p className="max-w-[330px] mx-auto m-0 text-[#667b9b] text-[13.5px] leading-[1.5]">
              {enviado
                ? "Sua senha foi alterada com sucesso. Agora você já pode acessar sua conta."
                : "Digite sua nova senha e confirme para concluir a recuperação do acesso."}
            </p>
          </header>

          {erro && (
            <div
              role="alert"
              className="flex items-start gap-2 mb-[16px] p-3 text-[13px] text-red-600 bg-red-50 border border-red-300 rounded-md"
            >
              <FiAlertCircle className="w-[18px] h-[18px] shrink-0 mt-[1px]" />
              <span>{erro}</span>
            </div>
          )}

          {enviado ? (
            <div className="text-center">
              <div className="w-[56px] h-[56px] mx-auto mb-[16px] flex items-center justify-center text-[#0874ca] bg-[#e8f3fd] rounded-full">
                <FiCheck className="w-[28px] h-[28px]" />
              </div>

              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-[13px] font-bold text-white bg-[#2174b7] rounded-lg hover:bg-[#1767a8] no-underline transition-colors"
              >
                Ir para o login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} noValidate>
                <label
                  className="block mb-[8px] text-[#202b3e] text-[12.5px] font-bold"
                  htmlFor="reset-senha"
                >
                  Nova senha
                </label>

                <div className="h-[44px] flex items-center gap-[10px] px-[13px] text-[#687d9a] bg-[#f7f9fb] border border-[#dce5ef] rounded-[8px] transition-all duration-150 focus-within:border-[#2174b7] focus-within:ring-4 focus-within:ring-[#2174b7]/10">
                  <FiLock className="w-[19px] h-[19px] shrink-0 stroke-[2.5]" />

                  <input
                    id="reset-senha"
                    type="password"
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    minLength={8}
                    className="w-full min-w-0 p-0 text-[#273449] font-inherit text-[13.5px] bg-transparent border-0 outline-none placeholder:text-[#8a9ab2]"
                  />
                </div>

                <p className="mt-[7px] text-[11.5px] text-[#8291a7]">
                  Utilize pelo menos 8 caracteres.
                </p>

                <label
                  className="block mt-[18px] mb-[8px] text-[#202b3e] text-[12.5px] font-bold"
                  htmlFor="reset-confirmar"
                >
                  Confirmar nova senha
                </label>

                <div className="h-[44px] flex items-center gap-[10px] px-[13px] text-[#687d9a] bg-[#f7f9fb] border border-[#dce5ef] rounded-[8px] transition-all duration-150 focus-within:border-[#2174b7] focus-within:ring-4 focus-within:ring-[#2174b7]/10">
                  <FiLock className="w-[19px] h-[19px] shrink-0 stroke-[2.5]" />

                  <input
                    id="reset-confirmar"
                    type="password"
                    autoComplete="new-password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Digite novamente sua senha"
                    required
                    className="w-full min-w-0 p-0 text-[#273449] font-inherit text-[13.5px] bg-transparent border-0 outline-none placeholder:text-[#8a9ab2]"
                  />
                </div>

                <button
                  className="w-full h-[42px] mt-[30px] text-white font-inherit text-[13px] font-bold bg-[#2174b7] border-0 rounded-[8px] cursor-pointer transition-colors duration-150 hover:bg-[#1767a8] disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={carregando || !token}
                >
                  {carregando ? "Salvando nova senha..." : "Salvar nova senha"}
                </button>
              </form>

              <Link
                to="/admin/login"
                className="mt-[20px] flex items-center justify-center gap-[8px] text-[#0874ca] text-[12.5px] font-bold no-underline hover:underline"
              >
                <FiArrowLeft className="w-[16px] h-[16px] shrink-0" />
                Voltar ao login
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}