import express from 'express';
import cors from 'cors';
import router from './routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

// Middleware de tratamento global de erros
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ erro: 'JSON malformatado enviado na requisição.' });
  }
  console.error('Unhandled Server Error:', err);
  return res.status(500).json({ erro: 'Erro interno no servidor.' });
});

export default app;