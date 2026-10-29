import { Router } from 'express';
import { newsletterService } from '../services/newsletter.service.js';
import { InscritoNewsletter } from '../models/InscritoNewsletter.js';

const router = Router();

router.get('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).send('<h2>E-mail inválido para descadastro.</h2>');
    }

    await newsletterService.descadastrarInscrito(email);

    return res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #0284c7;">🐾 Focinho Amigo</h2>
        <p style="font-size: 16px; color: #334155;">Inscrição cancelada com sucesso!</p>
        <p style="font-size: 14px; color: #64748b;">Você não receberá mais as nossas newsletters semanais.</p>
      </div>
    `);
  } catch (error: any) {
    return res.status(400).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #dc2626;">Erro no descadastro</h2>
        <p style="font-size: 14px; color: #64748b;">${error.message}</p>
      </div>
    `);
  }
});

router.post('/subscribe', async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ erro: 'E-mail é obrigatório.' });
    }

    // Busca ou cria o inscrito no banco
    const [inscrito, criado] = await InscritoNewsletter.findOrCreate({
      where: { email: email.trim().toLowerCase() },
      defaults: {
        nome: nome?.trim() || 'Amigo(a)',
        email: email.trim().toLowerCase(),
        ativo: true,
      },
    });

    // Se já existia mas estava inativo, reativa o cadastro
    if (!criado && !inscrito.ativo) {
      inscrito.ativo = true;
      if (nome) inscrito.nome = nome.trim();
      await inscrito.save();
    }

    return res.status(200).json({ mensagem: 'Inscrição realizada com sucesso!' });
  } catch (error: any) {
    return res.status(500).json({ erro: error.message || 'Erro ao realizar inscrição.' });
  }
});

export default router;