import type { Request, Response } from 'express';
import { pool } from '../config/index.js';

export class RelatorioController {

  // GET /api/relatorios/reposicao - Produtos que atingiram o estoque mínimo
  async produtosReposicao(_req: Request, res: Response): Promise<Response> {
    try {
      const query = 'SELECT * FROM vw_produtos_reposicao ORDER BY nome ASC';
      const resultado = await pool.query(query);
      return res.status(200).json(resultado.rows);
    } catch (erro) {
      console.error('RelatorioController.produtosReposicao error:', erro);
      return res.status(500).json({ erro: 'Erro interno ao buscar relatórios de reposição.' });
    }
  }

  // GET /api/relatorios/valor-produtos - Valor total em estoque por produto
  async valorProdutoEstoque(_req: Request, res: Response): Promise<Response> {
    try {
      const query = 'SELECT * FROM vw_valor_produto_estoque ORDER BY nome ASC';
      const resultado = await pool.query(query);
      return res.status(200).json(resultado.rows);
    } catch (erro) {
      console.error('RelatorioController.valorProdutoEstoque error:', erro);
      return res.status(500).json({ erro: 'Erro interno ao buscar valor por produto.' });
    }
  }

  // GET /api/relatorios/valor-total - Valor acumulado total de todo o estoque
  async valorTotalEstoque(_req: Request, res: Response): Promise<Response> {
    try {
      const query = 'SELECT * FROM vw_valor_total_estoque';
      const resultado = await pool.query(query);
      return res.status(200).json(resultado.rows[0]);
    } catch (erro) {
      console.error('RelatorioController.valorTotalEstoque error:', erro);
      return res.status(500).json({ erro: 'Erro interno ao calcular valor total do estoque.' });
    }
  }
}

export default new RelatorioController();