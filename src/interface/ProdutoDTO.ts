export interface CriarProdutoDTO {
  codigo: string;
  id_categoria: number;
  nome: string;
  descricao?: string;
  valor_unitario: number;
  quantidade_estoque: number;
  quantidade_minima: number;
  ativo?: boolean;
}

export type AtualizarProdutoDTO = Partial<CriarProdutoDTO>;