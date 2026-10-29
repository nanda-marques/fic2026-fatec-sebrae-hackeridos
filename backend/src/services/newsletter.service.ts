import { Resend } from 'resend';
import { ConteudoNewsletter } from '../models/ConteudoNewsletter.js';
import Animal from '../models/Animal.js';
import Publicacao from '../models/Publicacao.js';
import { InscritoNewsletter } from '../models/InscritoNewsletter.js';
import { gerarHtmlNewsletter } from '../helpers/newsletterHelper.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const newsletterService = {
  async dispararNewsletterSemanal() {
    const itensPendentes = await ConteudoNewsletter.findAll({
      where: { status: 'pendente' },
    });

    if (itensPendentes.length === 0) {
      return { enviados: 0, mensagem: 'Nenhum conteúdo pendente na fila.' };
    }

    const animalIds = itensPendentes
      .map((item) => item.animal_id)
      .filter((id): id is number => id !== null && id !== undefined);

    const conteudoIds = itensPendentes
      .map((item) => item.conteudo_id)
      .filter((id): id is number => id !== null && id !== undefined);

    const animais = animalIds.length > 0 ? await Animal.findAll({ where: { id: animalIds } }) : [];
    const publicacoes = conteudoIds.length > 0 ? await Publicacao.findAll({ where: { id: conteudoIds } }) : [];

    const animaisMap = new Map(animais.map((a) => [a.id, a]));
    const conteudosMap = new Map(publicacoes.map((p) => [p.id, p]));

    const linhasGrid: any[][] = [];
    for (let i = 0; i < itensPendentes.length; i += 2) {
      linhasGrid.push(itensPendentes.slice(i, i + 2));
    }

    const inscritos = await InscritoNewsletter.findAll({
      where: { ativo: true },
    });

    if (inscritos.length === 0) {
      return { enviados: 0, mensagem: 'Nenhum inscrito ativo encontrado.' };
    }

    let totalEnviados = 0;

    for (const inscrito of inscritos) {
      const htmlContent = gerarHtmlNewsletter(
        { nome: inscrito.nome, email: inscrito.email },
        linhasGrid,
        animaisMap,
        conteudosMap
      );

      await resend.emails.send({
        from: 'Focinho Amigo <onboarding@resend.dev>',
        to: inscrito.email,
        subject: '🐾 Edição Semanal - Focinho Amigo',
        html: htmlContent,
      });

      totalEnviados++;
    }

    await ConteudoNewsletter.update(
      { status: 'enviado', enviado_em: new Date() },
      { where: { status: 'pendente' } }
    );

    return { enviados: totalEnviados, mensagem: 'Disparo concluído com sucesso.' };
  },

  async descadastrarInscrito(email: string) {
    const inscrito = await InscritoNewsletter.findOne({ where: { email } });

    if (!inscrito) {
      throw new Error('E-mail não encontrado na base de dados.');
    }

    inscrito.ativo = false;
    await inscrito.save();

    console.log(`🔕 Inscrito descadastrado com sucesso: ${email}`);
    return { mensagem: 'Inscrição cancelada com sucesso.' };
  },
};

export async function verificarEDispararNewsletter() {
  const totalPendentes = await ConteudoNewsletter.count({
    where: { status: 'pendente' },
  });

  if (totalPendentes >= 4) {
    await newsletterService.dispararNewsletterSemanal();
  }
}

export async function inscreverNewsletter(nome: string, email: string) {
  const resposta = await fetch('http://localhost:3000/api/newsletter/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nome, email }),
  });

  if (!resposta.ok) {
    const erroData = await resposta.json();
    throw new Error(erroData.erro || 'Falha ao cadastrar na newsletter.');
  }

  return await resposta.json();
}