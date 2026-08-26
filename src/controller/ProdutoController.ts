import type { Request, Response } from 'express';
import { pool } from '../config/index.js';
import type { CriarProdutoDTO, AtualizarProdutoDTO } from '../interface/ProdutoDTO.js';

export class ProdutoController {

  // POST /api/Produtos - Cadastrar Produto
  async criar(req: Request, res: Response): Promise<Response> {
    try {
      // Os dados já chegam validados e sanitizados pelo middleware Zod
      const dados = req.body as CriarProdutoDTO;
      console.log('ProdutoController.criar chamado com body:', dados);

      // Validação de Regra de Negócio: Verificar se a Categoria existe no banco
      const categoriaExiste = await pool.query(
        'SELECT id_categoria FROM categoria WHERE id_categoria = $1',
        [dados.id_categoria]
      );

      if (categoriaExiste.rows.length === 0) {
        return res.status(404).json({ erro: 'A categoria informada não existe.' });
      }

      // Mapear campos da API para colunas reais do banco
      const query = `
        INSERT INTO produto 
        (codigo, id_categoria, nome, descricao, preco_unitario, quantidade_disponivel, quantidade_minima) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `;

      const valores = [
        dados.codigo,
        dados.id_categoria,
        dados.nome,
        dados.descricao,
        // API usa `valor_unitario`, DB usa `preco_unitario`
        dados.valor_unitario,
        // API usa `quantidade_estoque`, DB usa `quantidade_disponivel`
        dados.quantidade_estoque,
        dados.quantidade_minima
      ];

      const resultado = await pool.query(query, valores);

      // Mapear resposta do DB para forma esperada pela API (retrocompatibilidade)
      const row = resultado.rows[0];
      const resposta = {
        id_produto: row.id_produto,
        codigo: row.codigo,
        id_categoria: row.id_categoria,
        nome: row.nome,
        descricao: row.descricao,
        quantidade_estoque: row.quantidade_disponivel,
        quantidade_minima: row.quantidade_minima,
        valor_unitario: Number(row.preco_unitario),
      };

      return res.status(201).json(resposta);

    } catch (erro: any) {
      console.error('ProdutoController.criar error:', erro);
      if (erro && erro.code === '23505') {
        return res.status(400).json({ erro: 'Já existe um produto cadastrado com este código.' });
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

      const dados = req.body as AtualizarProdutoDTO;

      // Verifica se o produto existe
      const produtoExiste = await pool.query(
        'SELECT id_produto FROM produto WHERE id_produto = $1',
        [id]
      );

      if (produtoExiste.rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      // Se enviou categoria para atualizar, verifica se ela existe
      if (dados.id_categoria) {
        const categoriaExiste = await pool.query(
          'SELECT id_categoria FROM categoria WHERE id_categoria = $1',
          [dados.id_categoria]
        );
        if (categoriaExiste.rows.length === 0) {
          return res.status(404).json({ erro: 'A categoria informada não existe.' });
        }
      }

      // Mapear campos recebidos (API) para colunas do DB quando necessário
      const campoMap: Record<string, string> = {
        quantidade_estoque: 'quantidade_disponivel',
        valor_unitario: 'preco_unitario',
      };

      const campos = Object.keys(dados);
      if (campos.length === 0) {
        return res.status(400).json({ erro: 'Nenhum campo fornecido para atualização.' });
      }

      // Substitui nomes de campos pela coluna do DB quando mapeado
      const setParts = campos.map((campo, index) => {
        const coluna = campoMap[campo] || campo;
        return `${coluna} = $${index + 1}`;
      });

      const setClause = setParts.join(', ');
      const valores = [...Object.values(dados), id];

      const queryText = `
        UPDATE produto 
        SET ${setClause} 
        WHERE id_produto = $${valores.length} 
        RETURNING *;
      `;

      const resultado = await pool.query(queryText, valores);

      // Mapear resposta para formato da API
      const row = resultado.rows[0];
      const resposta = {
        id_produto: row.id_produto,
        codigo: row.codigo,
        id_categoria: row.id_categoria,
        nome: row.nome,
        descricao: row.descricao,
        quantidade_estoque: row.quantidade_disponivel ?? row.quantidade_estoque,
        quantidade_minima: row.quantidade_minima,
        valor_unitario: Number(row.preco_unitario ?? row.valor_unitario),
      };

      return res.status(200).json(resposta);

    } catch (erro: any) {
      console.error('ProdutoController.atualizar error:', erro);
      if (erro && erro.code === '23505') {
        return res.status(400).json({ erro: 'Já existe um produto com este código.' });
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

      // Mapear colunas do DB para formato da API
      const rows = resultado.rows.map((row: any) => ({
        id_produto: row.id_produto,
        codigo: row.codigo,
        id_categoria: row.id_categoria,
        nome: row.nome,
        descricao: row.descricao,
        quantidade_estoque: row.quantidade_disponivel,
        quantidade_minima: row.quantidade_minima,
        valor_unitario: Number(row.preco_unitario),
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

      const resultado = await pool.query('SELECT * FROM produto WHERE id_produto = $1', [id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      const row = resultado.rows[0];
      const resposta = {
        id_produto: row.id_produto,
        codigo: row.codigo,
        id_categoria: row.id_categoria,
        nome: row.nome,
        descricao: row.descricao,
        quantidade_estoque: row.quantidade_disponivel,
        quantidade_minima: row.quantidade_minima,
        valor_unitario: Number(row.preco_unitario),
      };

      return res.status(200).json(resposta);
    } catch (erro: any) {
      console.error('ProdutoController.buscarPorId error:', erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
}

export default new ProdutoController();