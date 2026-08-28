import type { criarCategoriaSchema, atualizarCategoriaSchema } from "../schemas/categoria.schema.js";
import { z } from 'zod';


// DTO para a criação de uma Categoria (Entrada) — agora inferido do schema Zod
export type CriarCategoriaDTO = z.infer<typeof criarCategoriaSchema>;

// DTO para atualização parcial ou total de uma Categoria (Entrada) — inferido também
export type AtualizarCategoriaDTO = z.infer<typeof atualizarCategoriaSchema>;

// DTO para a resposta da API (Saída)
export interface CategoriaResponseDTO {
  id_categoria: number;
  nome: string;
}