import type { Request, Response } from 'express';
import { pool } from '../config/index.js';
import type { CriarProdutoDTO, AtualizarProdutoDTO } from '../interface/ProdutoDTO.js';

export class ProdutoController {

  // POST /api/Produtos - Cadastrar Produto
  async criar(req: Request, res: Response): Promise<Response> {
    try {
      const dados = req.body as CriarProdutoDTO & { ativo?: boolean };

      const categoriaExiste = await pool.query(
        'SELECT id_categoria FROM categoria WHERE id_categoria = $1',
        [dados.id_categoria]
      );

      if (categoriaExiste.rows.length === 0) {
        return res.status(404).json({ erro: 'A categoria informada não existe.' });
      }

      const query = `
        INSERT INTO produto 
        (codigo, id_categoria, nome, descricao, preco_unitario, quantidade_disponivel, quantidade_minima, ativo) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `;

      const valores = [
        dados.codigo.trim(),
        dados.id_categoria,
        dados.nome.trim(),
        dados.descricao ? dados.descricao.trim() : null,
        dados.valor_unitario,
        dados.quantidade_estoque,
        dados.quantidade_minima,
        dados.ativo ?? true,
      ];

      const resultado = await pool.query(query, valores);
      const row = resultado.rows[0];

      return res.status(201).json({
        id_produto: row.id_produto,
        codigo: row.codigo,
        id_categoria: row.id_categoria,
        nome: row.nome,
        descricao: row.descricao,
        quantidade_estoque: row.quantidade_disponivel,
        quantidade_minima: row.quantidade_minima,
        valor_unitario: Number(row.preco_unitario),
        ativo: row.ativo,
      });

    } catch (erro: any) {
      console.error('ProdutoController.criar error:', erro);

      if (erro && erro.code === '23505') {
        return res.status(400).json({ erro: 'Já existe um produto cadastrado com este código.' });
      }

      if (erro && erro.code === '23514') {
        return res.status(400).json({ erro: 'Valores inválidos. Preço e quantidades não podem ser negativos.' });
      }

      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // PUT /api/Produtos/:idProduto - Atualizar Produto
  async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.idProduto);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID de produto inválido.' });
      }

      const dados = req.body as AtualizarProdutoDTO & { ativo?: boolean };

      const produtoExiste = await pool.query(
        'SELECT id_produto FROM produto WHERE id_produto = $1',
        [id]
      );

      if (produtoExiste.rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      if (dados.id_categoria) {
        const categoriaExiste = await pool.query(
          'SELECT id_categoria FROM categoria WHERE id_categoria = $1',
          [dados.id_categoria]
        );
        if (categoriaExiste.rows.length === 0) {
          return res.status(404).json({ erro: 'A categoria informada não existe.' });
        }
      }

      // Mapeamento de campos da API/DTO para colunas do Banco de Dados
      const mapaColunas: Record<string, string> = {
        codigo: 'codigo',
        id_categoria: 'id_categoria',
        nome: 'nome',
        descricao: 'descricao',
        quantidade_estoque: 'quantidade_disponivel',
        quantidade_minima: 'quantidade_minima',
        valor_unitario: 'preco_unitario',
        ativo: 'ativo',
      };

      const setParts: string[] = [];
      const valores: any[] = [];
      let index = 1;

      for (const key of Object.keys(dados)) {
        if (mapaColunas[key] !== undefined && (dados as any)[key] !== undefined) {
          setParts.push(`${mapaColunas[key]} = $${index}`);
          valores.push((dados as any)[key]);
          index++;
        }
      }

      if (setParts.length === 0) {
        return res.status(400).json({ erro: 'Nenhum campo válido fornecido para atualização.' });
      }

      valores.push(id);
      const queryText = `
        UPDATE produto 
        SET ${setParts.join(', ')} 
        WHERE id_produto = $${index} 
        RETURNING *;
      `;

      const resultado = await pool.query(queryText, valores);
      const row = resultado.rows[0];

      return res.status(200).json({
        id_produto: row.id_produto,
        codigo: row.codigo,
        id_categoria: row.id_categoria,
        nome: row.nome,
        descricao: row.descricao,
        quantidade_estoque: row.quantidade_disponivel,
        quantidade_minima: row.quantidade_minima,
        valor_unitario: Number(row.preco_unitario),
        ativo: row.ativo,
      });

    } catch (erro: any) {
      console.error('ProdutoController.atualizar error:', erro);

      if (erro && erro.code === '23505') {
        return res.status(400).json({ erro: 'Já existe um produto com este código.' });
      }

      if (erro && erro.code === '23514') {
        return res.status(400).json({ erro: 'Valores inválidos. Preço e quantidades não podem ser negativos.' });
      }

      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // GET /api/Produtos - Listar todos os produtos
  async listar(req: Request, res: Response): Promise<Response> {
    try {
      const query = `
        SELECT p.*, c.nome AS categoria_nome 
        FROM produto p
        JOIN categoria c ON c.id_categoria = p.id_categoria
        ORDER BY p.id_produto ASC
      `;
      const resultado = await pool.query(query);

      const rows = resultado.rows.map((row: any) => ({
        id_produto: row.id_produto,
        codigo: row.codigo,
        id_categoria: row.id_categoria,
        nome: row.nome,
        descricao: row.descricao,
        quantidade_estoque: row.quantidade_disponivel,
        quantidade_minima: row.quantidade_minima,
        valor_unitario: Number(row.preco_unitario),
        ativo: row.ativo,
        categoria_nome: row.categoria_nome,
      }));

      return res.status(200).json(rows);
    } catch (erro: any) {
      console.error('ProdutoController.listar error:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // GET /api/Produtos/:idProduto - Buscar Produto por ID
  async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.idProduto);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID de produto inválido.' });
      }

      const query = `
        SELECT p.*, c.nome AS categoria_nome 
        FROM produto p
        JOIN categoria c ON c.id_categoria = p.id_categoria
        WHERE p.id_produto = $1
      `;
      const resultado = await pool.query(query, [id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      const row = resultado.rows[0];
      return res.status(200).json({
        id_produto: row.id_produto,
        codigo: row.codigo,
        id_categoria: row.id_categoria,
        nome: row.nome,
        descricao: row.descricao,
        quantidade_estoque: row.quantidade_disponivel,
        quantidade_minima: row.quantidade_minima,
        valor_unitario: Number(row.preco_unitario),
        ativo: row.ativo,
        categoria_nome: row.categoria_nome,
      });
    } catch (erro: any) {
      console.error('ProdutoController.buscarPorId error:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // DELETE /api/Produtos/:idProduto - Deletar Produto
  async deletar(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.idProduto);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID de produto inválido.' });
      }

      const resultado = await pool.query('DELETE FROM produto WHERE id_produto = $1 RETURNING *', [id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado para remoção.' });
      }

      return res.status(200).json({ mensagem: 'Produto removido com sucesso.' });
    } catch (erro: any) {
      console.error('ProdutoController.deletar error:', erro);

      // Captura a tentativa de exclusão de produtos vinculados a movimentações
      if (erro && erro.code === '23503') {
        return res.status(400).json({
          erro: 'Este produto possui histórico de movimentações e não pode ser excluído. Em vez disso, altere o status para inativo (ativo = false).'
        });
      }

      return res.status(500).json({ erro: 'Erro interno no servidor ao tentar deletar produto.' });
    }
  }
}

export default new ProdutoController();