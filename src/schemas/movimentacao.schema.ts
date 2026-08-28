import { z } from 'zod';

// 1. Objeto base sem validações de .refine()
const movimentacaoBaseSchema = z.object({
  id_produto: z.number({ message: 'O id_produto deve ser um número.' })
    .int('O id_produto deve ser um número inteiro.')
    .positive('O id_produto deve ser maior que zero.'),

  tipo: z.enum(['ENTRADA', 'SAIDA'], {
    message: 'O tipo deve ser "ENTRADA" ou "SAIDA".',
  }),

  motivo: z.enum(
    ['RECEBIMENTO', 'VENDA', 'USO_INTERNO', 'PERDA', 'DANIFICADO', 'CORRECAO'],
    { message: 'Motivo inválido.' }
  ),

  quantidade: z.number({ message: 'A quantidade deve ser um número.' })
    .int('A quantidade deve ser um número inteiro.')
    .positive('A quantidade deve ser maior que zero.'),

  preco_unitario_praticado: z.number().nonnegative().optional().nullable(),
  valor_total: z.number().nonnegative().optional().nullable(),

  observacao: z.string({ message: 'A observação é obrigatória.' })
    .trim()
    .min(1, 'A observação não pode ser vazia.')
    .max(255, 'A observação deve ter no máximo 255 caracteres.'),

  id_movimentacao_origem: z.number({
    message: 'O id da movimentação de origem deve ser um número.'
  })
    .int('O id da movimentação de origem deve ser um número inteiro.')
    .positive('O id da movimentação de origem deve ser maior que zero.')
    .nullish(),
});

// 2. Schema de criação com regras de negócio (.refine)
export const criarMovimentacaoSchema = movimentacaoBaseSchema
  .refine((data) => {
    if (data.motivo === 'VENDA') {
      return data.tipo === 'SAIDA' && data.preco_unitario_praticado != null && data.valor_total != null;
    }
    return data.preco_unitario_praticado == null && data.valor_total == null;
  }, {
    message: 'Em vendas, o tipo deve ser SAIDA e os valores financeiros são obrigatórios. Nos demais motivos, esses campos devem permanecer vazios.',
    path: ['motivo'],
  })
  .refine((data) => {
    if (data.motivo === 'CORRECAO') {
      return data.id_movimentacao_origem != null;
    }
    return data.id_movimentacao_origem == null;
  }, {
    message: 'O campo id_movimentacao_origem deve ser informado apenas para movimentações de CORRECAO.',
    path: ['id_movimentacao_origem'],
  })
  .refine((data) => {
    if (data.motivo === 'RECEBIMENTO') {
      return data.tipo === 'ENTRADA';
    }
    return true;
  }, {
    message: 'Um recebimento deve possuir o tipo ENTRADA.',
    path: ['tipo'],
  });

// 3. Schema de atualização gerado a partir do objeto base
export const atualizarMovimentacaoSchema = movimentacaoBaseSchema.partial();