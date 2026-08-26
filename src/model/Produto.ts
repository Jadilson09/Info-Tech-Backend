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
    // Inserir usando nomes de colunas reais do banco e manter compatibilidade na resposta
    const query = `
      INSERT INTO produto 
      (codigo, id_categoria, nome, descricao, preco_unitario, quantidade_disponivel, quantidade_minima) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const valores = [
      produto.codigo.trim(),
      produto.id_categoria,
      produto.nome.trim(),
      produto.descricao.trim(),
      produto.valor_unitario,
      produto.quantidade_estoque,
      produto.quantidade_minima
    ];

    const resultado = await pool.query(query, valores);
    const row = resultado.rows[0];
    // Normalizar para formato usado pela API
    return {
      id_produto: row.id_produto,
      codigo: row.codigo,
      id_categoria: row.id_categoria,
      nome: row.nome,
      descricao: row.descricao,
      quantidade_estoque: row.quantidade_disponivel,
      quantidade_minima: row.quantidade_minima,
      valor_unitario: Number(row.preco_unitario),
    };
  }

  async listar(): Promise<IProduto[]> {
    const query = `
      SELECT p.*, c.nome AS categoria_nome 
      FROM produto p
      JOIN categoria c ON c.id_categoria = p.id_categoria
      ORDER BY p.id_produto ASC
    `;
    const resultado = await pool.query(query);
    // Normalizar colunas do DB para formato da API
    return resultado.rows.map((row: any) => ({
      id_produto: row.id_produto,
      codigo: row.codigo,
      id_categoria: row.id_categoria,
      nome: row.nome,
      descricao: row.descricao,
      quantidade_estoque: row.quantidade_disponivel,
      quantidade_minima: row.quantidade_minima,
      valor_unitario: Number(row.preco_unitario),
    }));
  }

  async buscarPorId(id: number): Promise<IProduto | null> {
    const query = 'SELECT * FROM produto WHERE id_produto = $1';
    const resultado = await pool.query(query, [id]);
    const row = resultado.rows[0];
    if (!row) return null;
    return {
      id_produto: row.id_produto,
      codigo: row.codigo,
      id_categoria: row.id_categoria,
      nome: row.nome,
      descricao: row.descricao,
      quantidade_estoque: row.quantidade_disponivel,
      quantidade_minima: row.quantidade_minima,
      valor_unitario: Number(row.preco_unitario),
    };
  }
}

export default new ProdutoModel();