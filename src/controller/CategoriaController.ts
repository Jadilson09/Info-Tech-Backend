import type { Request, Response } from 'express';
import { pool } from '../config/index.js';
import type { CriarCategoriaDTO, AtualizarCategoriaDTO } from '../interface/CategoriaDTO.js';


export class CategoriaController {
  
  // POST /categorias - Cadastrar Categoria
  async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { nome } = req.body;

      // 1. Validar se o campo foi enviado
      if (!nome) {
        return res.status(400).json({ erro: 'O campo "nome" é obrigatório.' });
      }

      // 2. Validar tipo e tamanho (VARCHAR(80))
      if (typeof nome !== 'string' || nome.trim().length === 0) {
        return res.status(400).json({ erro: 'O nome deve ser um texto válido.' });
      }

      if (nome.trim().length > 80) {
        return res.status(400).json({ erro: 'O nome da categoria deve ter no máximo 80 caracteres.' });
      }

      // 3. Inserção no banco
      const query = 'INSERT INTO categoria (nome) VALUES ($1) RETURNING *';
      const resultado = await pool.query(query, [nome.trim()]);

      return res.status(201).json(resultado.rows[0]);

    } catch (erro: any) {
      // Regra de unicidade (nome único)
      if (erro.code === '23505') {
        return res.status(400).json({ erro: 'Já existe uma categoria cadastrada com este nome.' });
      }
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
async atualizar(req: Request, res: Response): Promise<Response> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'O id_categoria deve ser um número inteiro válido.' });
    }

    const dados = req.body as AtualizarCategoriaDTO;

    const resultado = await pool.query(
      'UPDATE categoria SET nome = COALESCE($1, nome) WHERE id_categoria = $2 RETURNING *',
      [dados.nome?.trim(), id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    return res.status(200).json(resultado.rows[0]);
  } catch (erro: unknown) {
    console.error('CategoriaController.atualizar error:', erro);
    if (typeof erro === 'object' && erro !== null && 'code' in erro && erro.code === '23505') {
      return res.status(400).json({ erro: 'Já existe uma categoria cadastrada com este nome.' });
    }
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

  // GET /categorias - Listar Categorias
  async listar(req: Request, res: Response): Promise<Response> {
    try {
      const query = 'SELECT * FROM categoria ORDER BY id_categoria ASC';
      const resultado = await pool.query(query);
      return res.status(200).json(resultado.rows);
    } catch (erro) {
      console.error('CategoriaController.listar error:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  // GET /categorias/:id - Buscar Categoria por ID
  async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'O id_categoria deve ser um número inteiro válido.' });
      }

      const resultado = await pool.query('SELECT * FROM categoria WHERE id_categoria = $1', [id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Categoria não encontrada.' });
      }

      return res.status(200).json({
        id_categoria: resultado.rows[0].id_categoria,
        nome: resultado.rows[0].nome
      });
    } catch (erro) {
      console.error('CategoriaController.buscarPorId error:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

async deletar(req: Request, res: Response): Promise<Response> {
  try {
    const id = Number(req.params.idCategoria);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'O id_categoria deve ser um número inteiro válido.' });
    }

    const resultado = await pool.query('DELETE FROM categoria WHERE id_categoria = $1', [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada para remoção.' });
    }

    return res.status(200).json({ mensagem: 'Categoria removida com sucesso.' });
  } catch (erro: any) {
    // Captura violação de chave estrangeira (FK)
    if (erro && erro.code === '23503') {
      return res.status(400).json({
        erro: 'Não é possível excluir esta categoria pois existem produtos vinculados a ela. Reatribua ou remova os produtos antes de excluir.'
      });
    }

    console.error('CategoriaController.deletar error:', erro);
    return res.status(500).json({ erro: 'Erro interno no servidor ao tentar deletar categoria.' });
  }
 }
}
export default new CategoriaController();