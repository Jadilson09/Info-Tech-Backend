import { z } from 'zod';

export const criarProdutoSchema = z.object({
  codigo: z.string().trim().min(1, 'Código é obrigatório.'),
  id_categoria: z.number().int().positive('ID da categoria inválido.'),
  nome: z.string().trim().min(1, 'Nome é obrigatório.').max(100),
  descricao: z.string().trim().optional(),
  valor_unitario: z.number().positive('O valor unitário deve ser positivo.'),
  quantidade_estoque: z.number().int().min(0, 'Quantidade não pode ser negativa.'),
  quantidade_minima: z.number().int().min(0, 'Quantidade mínima não pode ser negativa.'),
  ativo: z.boolean().optional(),
});

export const atualizarProdutoSchema = criarProdutoSchema.partial();