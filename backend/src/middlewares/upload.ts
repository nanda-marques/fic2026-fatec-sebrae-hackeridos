import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas.'));
    }
    cb(null, true);
  },
});

export const uploadCSV = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const nome = file.originalname.toLocaleLowerCase('pt-BR');
    const ehCSV = nome.endsWith('.csv') || file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel';
    if (!ehCSV) return cb(new Error('Apenas arquivos CSV são permitidos.'));
    cb(null, true);
  },
});