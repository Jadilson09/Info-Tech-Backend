import type { Request, Response } from 'express';
import { pool } from '../config/index.js';

export class MovimentacaoController {

  // POST /api/Movimentacoes - Registrar Movimentação
  async criar(req: Request, res: Response): Promise<Response> {
    try {
      const dados = req.body;

      if (dados.id_movimentacao_origem) {
        const movimentacaoExiste = await pool.query(
          'SELECT id_movimentacao FROM movimentacao WHERE id_movimentacao = $1',
          [dados.id_movimentacao_origem]
        );

        if (movimentacaoExiste.rows.length === 0) {
          return res.status(404).json({ erro: 'A movimentação de origem informada não existe.' });
        }
      }

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
        dados.id_produto,
        dados.tipo,
        dados.motivo,
        dados.quantidade,
        dados.preco_unitario_praticado ?? null,
        dados.valor_total ?? null,
        dados.observacao,
        dados.id_movimentacao_origem ?? null,
      ];

      const resultado = await pool.query(query, valores);
      return res.status(201).json(resultado.rows[0]);

    } catch (erro: any) {
      console.error('MovimentacaoController.criar error:', erro);

      // Captura a exceção disparada pelos Triggers (ex: estoque insuficiente, produto desativado)
      if (erro && erro.message) {
        return res.status(400).json({ erro: erro.message });
      }

      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // PUT /api/Movimentacoes/:idMovimentacao - Bloqueado por Trigger
  async atualizar(_req: Request, res: Response): Promise<Response> {
    return res.status(405).json({
      erro: 'Uma movimentação confirmada não pode ser alterada. Registre uma nova movimentação do tipo CORRECAO.'
    });
  }

  // DELETE /api/Movimentacoes/:idMovimentacao - Bloqueado por Trigger
  async deletar(_req: Request, res: Response): Promise<Response> {
    return res.status(405).json({
      erro: 'Uma movimentação confirmada não pode ser excluída. Registre uma nova movimentação do tipo CORRECAO.'
    });
  }

  // GET /api/Movimentacoes - Listar histórico de movimentações
  async listar(req: Request, res: Response): Promise<Response> {
    try {
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
      return res.status(200).json(resultado.rows);
    } catch (erro: any) {
      console.error('MovimentacaoController.listar error:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // GET /api/Movimentacoes/:idMovimentacao - Buscar movimentação por ID
  async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.idMovimentacao);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID da movimentação inválido.' });
      }

      const query = `
        SELECT 
          m.*, 
          p.nome AS produto_nome,
          p.codigo AS produto_codigo
        FROM movimentacao m
        JOIN produto p ON p.id_produto = m.id_produto
        WHERE m.id_movimentacao = $1
      `;

      const resultado = await pool.query(query, [id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Movimentação não encontrada.' });
      }

      return res.status(200).json(resultado.rows[0]);
    } catch (erro: any) {
      console.error('MovimentacaoController.buscarPorId error:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
}

export default new MovimentacaoController();