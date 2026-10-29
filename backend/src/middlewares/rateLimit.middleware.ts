import rateLimit from "express-rate-limit";

// Limite de tentativas de login por IP. 5 tentativas em 15 minutos. Após isso, bloqueia por 15 min.

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,  // 5 tentativas por janela
  standardHeaders: true, // retorna RateLimit-* headers
  legacyHeaders: false,
  message: {
    erro: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  skipSuccessfulRequests: true, // não conta tentativas bem-sucedidas
  keyGenerator: (req) => {
    // Por IP + email (evita bloquear um IP inteiro se só um usuário errou)
    const email = (req.body as { email?: string })?.email ?? "anon";
    const ip = req.ip ?? "unknown";
    return `${ip}:${email.toLowerCase()}`;
  },
});

export const cadastroRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,                    // 3 cadastros por hora por IP
  message: {
    erro: "Muitos cadastros a partir deste IP. Tente novamente mais tarde.",
  },
});