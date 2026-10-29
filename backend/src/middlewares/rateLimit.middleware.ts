import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Detectamos várias tentativas de login. Por segurança, aguarde 15 minutos antes de tentar novamente.",
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = (req.body as { email?: string })?.email ?? "anon";
    const ip = ipKeyGenerator(req.ip ?? "unknown");
    return `${ip}:${email.toLowerCase()}`;
  },
});

export const recuperacaoRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Muitas solicitações de recuperação. Tente novamente em 1 hora.",
  },
  keyGenerator: (req) => {
    const email = (req.body as { email?: string })?.email ?? "anon";
    const ip = ipKeyGenerator(req.ip ?? "unknown");
    return `${ip}:${email.toLowerCase()}`;
  },
});

export const cadastroRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Muitos cadastros a partir deste IP. Tente novamente mais tarde.",
  },
});