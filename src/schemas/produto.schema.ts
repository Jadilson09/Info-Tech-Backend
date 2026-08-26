// src/schemas/produto.schema.ts
import { z } from 'zod';

export const criarProdutoSchema = z.object({
  codigo: z.string()
    .trim()
    .min(1, 'O código é obrigatório.')
    .max(50, 'O código deve ter no máximo 50 caracteres.'),

  id_categoria: z.number({ message: 'O id_categoria deve ser um número.' })
    .int('O id_categoria deve ser um número inteiro.')
    .positive('O id_categoria deve ser maior que zero.'),

  nome: z.string()
    .trim()
    .min(1, 'O nome é obrigatório.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),

  descricao: z.string()
    .trim()
    .min(1, 'A descrição é obrigatória.')
    .max(100, 'A descrição deve ter no máximo 100 caracteres.'),

  quantidade_estoque: z.number({ message: 'A quantidade de estoque deve ser um número.' })
    .int('A quantidade de estoque deve ser um número inteiro.')
    .nonnegative('A quantidade de estoque não pode ser negativa.'),

  quantidade_minima: z.number({ message: 'A quantidade mínima deve ser um número.' })
    .int('A quantidade mínima deve ser um número inteiro.')
    .nonnegative('A quantidade mínima não pode ser negativa.'),

  valor_unitario: z.number({ message: 'O valor unitário deve ser um número.' })
    .positive('O valor unitário deve ser maior que zero.'),
});

export const atualizarProdutoSchema = criarProdutoSchema.partial();