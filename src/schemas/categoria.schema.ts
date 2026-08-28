import { z } from 'zod';

export const criarCategoriaSchema = z.object({
  nome: z.string()
    .trim()
    .min(1, 'O nome é obrigatório.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),
});

export const atualizarCategoriaSchema = criarCategoriaSchema.partial();