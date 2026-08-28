import { pool } from '../config/index.js';

export interface IMovimentacao {
  id_movimentacao?: number;
  id_produto: number;
  id_movimentacao_origem?: number | null;
  tipo: 'ENTRADA' | 'SAIDA';
  motivo: 'RECEBIMENTO' | 'VENDA' | 'USO_INTERNO' | 'PERDA' | 'DANIFICADO' | 'CORRECAO';
  quantidade: number;
  preco_unitario_praticado?: number | null;
  valor_total?: number | null;
  observacao: string;
  data_movimentacao?: Date;
}

export class MovimentacaoModel {
  async criar(movimentacao: IMovimentacao): Promise<IMovimentacao> {
    const query = `
      INSERT INTO movimentacao (
        id_produto, 
        tipo, 
        motivo, 
        quantidade, 
        preco_unitario_praticado, 
        valor_total, 
        observacao, 
        id_movimentacao_origem
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const valores = [
      movimentacao.id_produto,
      movimentacao.tipo,
      movimentacao.motivo,
      movimentacao.quantidade,
      movimentacao.preco_unitario_praticado ?? null,
      movimentacao.valor_total ?? null,
      movimentacao.observacao.trim(),
      movimentacao.id_movimentacao_origem ?? null
    ];

    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  async listar(): Promise<IMovimentacao[]> {
    const query = `
      SELECT 
        m.*, 
        p.nome AS produto_nome, 
        p.codigo AS produto_codigo 
      FROM movimentacao m
      JOIN produto p ON p.id_produto = m.id_produto
      ORDER BY m.id_movimentacao DESC
    `;
    const resultado = await pool.query(query);
    return resultado.rows;
  }

  async buscarPorId(id: number): Promise<IMovimentacao | null> {
    const query = 'SELECT * FROM movimentacao WHERE id_movimentacao = $1';
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0] || null;
  }
}

export default new MovimentacaoModel();