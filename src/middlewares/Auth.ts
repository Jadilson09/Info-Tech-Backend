// src/middlewares/Auth.ts
import type { Request, Response, NextFunction } from 'express';

export class Auth {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    // Implemente a verificação do seu token JWT aqui futuramente
    // Exemplo temporário:
    const token = req.headers.authorization;

    if (!token) {
      // return res.status(401).json({ erro: 'Acesso não autorizado' });
    }

    next();
  }
}