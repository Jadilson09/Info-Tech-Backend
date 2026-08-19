import { pool } from '../config/index.js';

// Interface do Objeto Produto
export interface IProduto {
  id_produto?: number;
  codigo: string;
  id_categoria: number;
  nome: string;
  descricao: string;
  quantidade_estoque: number;
  quantidade_minima: number;
  valor_unitario: number;
}

export class ProdutoModel {
  async criar(produto: IProduto): Promise<IProduto> {
    const query = `
      INSERT INTO produto 
      (codigo, id_categoria, nome, descricao, quantidade_estoque, quantidade_minima, valor_unitario) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const valores = [
      produto.codigo.trim(),
      produto.id_categoria,
      produto.nome.trim(),
      produto.descricao.trim(),
      produto.quantidade_estoque,
      produto.quantidade_minima,
      produto.valor_unitario
    ];

    const resultado = await pool.query(query, valores);
    return resultado.rows[0];
  }

  async listar(): Promise<IProduto[]> {
    const query = `
      SELECT p.*, c.nome AS categoria_nome 
      FROM produto p
      JOIN categoria c ON c.id_categoria = p.id_categoria
      ORDER BY p.id_produto ASC
    `;
    const resultado = await pool.query(query);
    return resultado.rows;
  }

  async buscarPorId(id: number): Promise<IProduto | null> {
    const query = 'SELECT * FROM produto WHERE id_produto = $1';
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0] || null;
  }
}

export default new ProdutoModel();