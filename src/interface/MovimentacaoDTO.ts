export interface CriarMovimentacaoDTO {
  id_produto: number;
  tipo: 'ENTRADA' | 'SAIDA';
  motivo: 'RECEBIMENTO' | 'VENDA' | 'USO_INTERNO' | 'PERDA' | 'DANIFICADO' | 'CORRECAO';
  quantidade: number;
  preco_unitario_praticado?: number | null;
  valor_total?: number | null;
  observacao: string;
  id_movimentacao_origem?: number | null;
}

export type AtualizarMovimentacaoDTO = Partial<CriarMovimentacaoDTO>;