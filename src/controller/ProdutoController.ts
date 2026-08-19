import type { Request, Response } from 'express';
import { pool } from '../config/index.js';

export class ProdutoController {

  // POST /produtos - Cadastrar Produto
  async criar(req: Request, res: Response): Promise<Response> {
    try {
      const {
        codigo,
        id_categoria,
        nome,
        descricao,
        quantidade_estoque,
        quantidade_minima,
        valor_unitario
      } = req.body;

      // 1. Verificar se todos os campos obrigatórios foram enviados
      if (
        !codigo ||
        !id_categoria ||
        !nome ||
        !descricao ||
        quantidade_estoque === undefined ||
        quantidade_minima === undefined ||
        valor_unitario === undefined
      ) {
        return res.status(400).json({
          erro: 'Todos os campos (codigo, id_categoria, nome, descricao, quantidade_estoque, quantidade_minima, valor_unitario) são obrigatórios.'
        });
      }

      // 2. Validar formatos e limites dos campos de texto (VARCHARs)
      if (typeof codigo !== 'string' || codigo.trim().length > 50) {
        return res.status(400).json({ erro: 'O código deve ser um texto de até 50 caracteres.' });
      }
      if (typeof nome !== 'string' || nome.trim().length > 100) {
        return res.status(400).json({ erro: 'O nome deve ser um texto de até 100 caracteres.' });
      }
      if (typeof descricao !== 'string' || descricao.trim().length > 100) {
        return res.status(400).json({ erro: 'A descrição deve ser um texto de até 100 caracteres.' });
      }

      // 3. Validar tipos e limites numéricos
      const catId = Number(id_categoria);
      const qtdEstoque = Number(quantidade_estoque);
      const qtdMinima = Number(quantidade_minima);
      const preco = Number(valor_unitario);

      if (!Number.isInteger(catId) || catId <= 0) {
        return res.status(400).json({ erro: 'O id_categoria deve ser um número inteiro válido.' });
      }
      if (!Number.isInteger(qtdEstoque) || qtdEstoque < 0) {
        return res.status(400).json({ erro: 'A quantidade de estoque deve ser um número inteiro maior ou igual a zero.' });
      }
      if (!Number.isInteger(qtdMinima) || qtdMinima < 0) {
        return res.status(400).json({ erro: 'A quantidade mínima deve ser um número inteiro maior ou igual a zero.' });
      }
      if (isNaN(preco) || preco <= 0) {
        return res.status(400).json({ erro: 'O valor unitário deve ser um número maior que zero.' });
      }

      // 4. Conferir se a Categoria informada existe no banco
      const categoriaExiste = await pool.query(
        'SELECT id_categoria FROM categoria WHERE id_categoria = $1',
        [catId]
      );
      if (categoriaExiste.rows.length === 0) {
        return res.status(404).json({ erro: 'A categoria informada não existe.' });
      }

      // 5. Inserir Produto no banco
      const query = `
        INSERT INTO produto 
        (codigo, id_categoria, nome, descricao, quantidade_estoque, quantidade_minima, valor_unitario) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `;
      const valores = [
        codigo.trim(),
        catId,
        nome.trim(),
        descricao.trim(),
        qtdEstoque,
        qtdMinima,
        preco
      ];

      const resultado = await pool.query(query, valores);
      return res.status(201).json(resultado.rows[0]);

    } catch (erro: any) {
      // Regra de unicidade (código do produto único)
      if (erro.code === '23505') {
        return res.status(400).json({ erro: 'Já existe um produto cadastrado com este código.' });
      }
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // GET /produtos - Listar Todos os Produtos
  async listar(req: Request, res: Response): Promise<Response> {
    try {
      const query = `
        SELECT p.*, c.nome AS categoria_nome 
        FROM produto p
        JOIN categoria c ON c.id_categoria = p.id_categoria
        ORDER BY p.id_produto ASC
      `;
      const resultado = await pool.query(query);
      return res.status(200).json(resultado.rows);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // GET /produtos/:id - Buscar Produto por ID (Conferir se existe)
  async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID de produto inválido.' });
      }

      const resultado = await pool.query('SELECT * FROM produto WHERE id_produto = $1', [id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      return res.status(200).json(resultado.rows[0]);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
}

export default new ProdutoController();