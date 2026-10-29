import { Resend } from "resend";
import bcryptjs from "bcryptjs";
import TokenRecuperacao from "../models/TokenRecuperacao.js";
import Administrador from "../models/Administrador.js";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

function gerarTokenAleatorio(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const recuperacaoService = {
  async solicitarRecuperacao(
    email: string
  ): Promise<{ enviado: boolean }> {
    const admin = await Administrador.findOne({
      where: { email },
    });

    if (!admin) {
      return { enviado: false };
    }

    const tokenPuro = gerarTokenAleatorio();
    const tokenHash = await bcryptjs.hash(tokenPuro, 10);

    const expiraEm = new Date(Date.now() + 60 * 60 * 1000);

    await TokenRecuperacao.create({
      adminId: admin.id,
      tokenHash,
      expiraEm,
      usado: false,
    });

    const link = `${process.env.FRONTEND_URL}/admin/resetar-senha?token=${tokenPuro}`;

    const { data, error } = await resend.emails.send({
      from:
        process.env.EMAIL_FROM ||
        "Focinho Amigo <onboarding@resend.dev>",
      to: email,
      subject: "Recuperação de Senha — Focinho Amigo",
      html: `
        <p>Solicitação de recuperação de senha.</p>
        <p>
          <a href="${link}">Clique aqui</a>
          para redefinir sua senha (válido por 1h).
        </p>
      `,
    });

    if (error) {
      console.error(
        "Erro ao enviar e-mail pela Resend:",
        error
      );

      throw new Error(
        "Falha no envio do e-mail de recuperação."
      );
    }

    console.log(
      "E-mail de recuperação aceito pela Resend. ID:",
      data?.id
    );

    return { enviado: true };
  },

  async validarToken(
    tokenPuro: string
  ): Promise<{ valido: boolean; adminId?: number }> {
    const tokens = await TokenRecuperacao.findAll({
      where: { usado: false },
    });

    for (const registro of tokens) {
      const valido = await bcryptjs.compare(
        tokenPuro,
        registro.tokenHash
      );

      if (valido && registro.expiraEm > new Date()) {
        return {
          valido: true,
          adminId: registro.adminId,
        };
      }
    }

    return { valido: false };
  },

  async redefinirSenha(
    tokenPuro: string,
    novaSenha: string
  ): Promise<boolean> {
    const tokens = await TokenRecuperacao.findAll({
      where: { usado: false },
    });

    for (const registro of tokens) {
      const valido = await bcryptjs.compare(
        tokenPuro,
        registro.tokenHash
      );

      if (valido && registro.expiraEm > new Date()) {
        const senhaHash = await bcryptjs.hash(
          novaSenha,
          10
        );

        await Administrador.update(
          { senhaHash },
          {
            where: { id: registro.adminId },
          }
        );

        await registro.update({ usado: true });

        return true;
      }
    }

    return false;
  },
};