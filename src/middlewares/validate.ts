import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export const validarSchema = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const erros = resultado.error.issues.map((e) => ({
        campo: e.path.join('.'),
        mensagem: e.message,
      }));

      return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
    }

    req.body = resultado.data;
    next();
  };
};