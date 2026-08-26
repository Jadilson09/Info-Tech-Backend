import type { Request, Response } from "express";
import { Router } from "express";

import CategoriaController from "./controller/CategoriaController.js";
import MovimentacaoController from "./controller/MovimentacaoController.js";
import ProdutoController from "./controller/ProdutoController.js";


import { validate } from "./middlewares/validate.js";
import { criarProdutoSchema, atualizarProdutoSchema } from "./schemas/produto.schema.js";

const router = Router();

router.get("/api", (req: Request, res: Response) => {
  res.status(200).json({ mensagem: "Olá, seja bem-vindo!" });
});

// Movimentações
router.get("/api/Movimentacoes", MovimentacaoController.listar);
router.post("/api/Movimentacoes", MovimentacaoController.criar);

// Categorias
router.get("/api/Categorias", CategoriaController.listar);
router.post("/api/Categorias", CategoriaController.criar);
router.get("/api/Categorias/:idCategoria", CategoriaController.buscarPorId);

// Produtos
router.get("/api/Produtos", ProdutoController.listar);
router.post("/api/Produtos", validate(criarProdutoSchema), ProdutoController.criar);
router.put("/api/Produtos/:idProduto", validate(atualizarProdutoSchema), ProdutoController.atualizar);
router.get("/api/Produtos/:idProduto", ProdutoController.buscarPorId);

export { router };