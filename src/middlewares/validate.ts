// src/middlewares/validate.ts
import { type Request, type Response, type NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => 
  (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const erros = resultado.error.flatten().fieldErrors;
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros });
    }

    req.body = resultado.data;
    next();
  };