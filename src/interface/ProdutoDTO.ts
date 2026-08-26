// src/interface/ProdutoDTO.ts
import { z } from 'zod';
import { criarProdutoSchema, atualizarProdutoSchema } from '../schemas/produto.schema.js';

// DTO para a criação de um Produto (Entrada) — agora inferido do schema Zod
export type CriarProdutoDTO = z.infer<typeof criarProdutoSchema>;

// DTO para atualização parcial ou total de Produto (Entrada) — inferido também
export type AtualizarProdutoDTO = z.infer<typeof atualizarProdutoSchema>;

// DTO para a resposta da API (Saída) — continua igual, não é validado por Zod
export interface ProdutoResponseDTO {
  id_produto: number;
  codigo: string;
  id_categoria: number;
  nome: string;
  descricao: string;
  quantidade_estoque: number;
  quantidade_minima: number;
  valor_unitario: number;
  categoria_nome?: string;
}