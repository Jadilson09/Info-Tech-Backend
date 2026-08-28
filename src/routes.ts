import { Router } from 'express';
import CategoriaController from './controller/CategoriaController.js';
import ProdutoController from './controller/ProdutoController.js';
import MovimentacaoController from './controller/MovimentacaoController.js';
import RelatorioController from './controller/RelatorioController.js';

import { validarSchema } from './middlewares/validate.js';
import { criarCategoriaSchema, atualizarCategoriaSchema } from './schemas/categoria.schema.js';
import { criarProdutoSchema, atualizarProdutoSchema } from './schemas/produto.schema.js';
import { criarMovimentacaoSchema } from './schemas/movimentacao.schema.js';

const router = Router();

// Categorias
router.post('/categorias', validarSchema(criarCategoriaSchema), (req, res) => CategoriaController.criar(req, res));
router.get('/categorias', (req, res) => CategoriaController.listar(req, res));
router.get('/categorias/:id', (req, res) => CategoriaController.buscarPorId(req, res));
router.put('/categorias/:id', validarSchema(atualizarCategoriaSchema), (req, res) => CategoriaController.atualizar(req, res));
router.delete('/categorias/:idCategoria', (req, res) => CategoriaController.deletar(req, res));

// Produtos
router.post('/produtos', validarSchema(criarProdutoSchema), (req, res) => ProdutoController.criar(req, res));
router.get('/produtos', (req, res) => ProdutoController.listar(req, res));
router.get('/produtos/:idProduto', (req, res) => ProdutoController.buscarPorId(req, res));
router.put('/produtos/:idProduto', validarSchema(atualizarProdutoSchema), (req, res) => ProdutoController.atualizar(req, res));
router.delete('/produtos/:idProduto', (req, res) => ProdutoController.deletar(req, res));

// Movimentações
router.post('/movimentacoes', validarSchema(criarMovimentacaoSchema), (req, res) => MovimentacaoController.criar(req, res));
router.get('/movimentacoes', (req, res) => MovimentacaoController.listar(req, res));
router.get('/movimentacoes/:idMovimentacao', (req, res) => MovimentacaoController.buscarPorId(req, res));
router.put('/movimentacoes/:idMovimentacao', (req, res) => MovimentacaoController.atualizar(req, res));
router.delete('/movimentacoes/:idMovimentacao', (req, res) => MovimentacaoController.deletar(req, res));

// Relatórios
router.get('/relatorios/reposicao', (req, res) => RelatorioController.produtosReposicao(req, res));
router.get('/relatorios/valor-produtos', (req, res) => RelatorioController.valorProdutoEstoque(req, res));
router.get('/relatorios/valor-total', (req, res) => RelatorioController.valorTotalEstoque(req, res));

export default router;