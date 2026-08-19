import type { Request, Response } from "express";
import { Router } from "express";
// Importa o controller de cada classe
import CategoriaController from "./controller/CategoriaController.js";
import MovimentacaoController from "./controller/MovimentacaoController.js";
import ProdutoController from "./controller/ProdutoController.js";
import { Auth } from "./middlewares/Auth.js";

const router = Router();

/**
 * Rota raiz da API para teste de conexão
 */
router.get("/api", (req: Request, res: Response) => {
    res.status(200).json({ mensagem: "Olá, seja bem-vindo!" });
});


// Retorna a lista com todos os pacientes (Ordem Alfabética)
router.get("/api/Movimentacoes", Auth.verifyToken ,MovimentacaoController.listar);
// Insere um novo paciente no banco de dados (rota pública para registro)
router.post("/api/Movimentacoes", Auth.verifyToken ,MovimentacaoController.criar);



// Retorna a lista com todos os médicos (Ordem Alfabética)
router.get("/api/Categorias", Auth.verifyToken ,CategoriaController.listar);
// Insere um novo médico no banco de dados
router.post("/api/Categorias", Auth.verifyToken ,CategoriaController.criar);
// Retorna o médico pelo ID
router.get("/api/Categorias/:idCategoria", Auth.verifyToken ,CategoriaController.buscarPorId);


// Retorna a lista com todas as consultas
router.get("/api/Produtos", Auth.verifyToken ,ProdutoController.listar);
// Cadastra uma nova consulta
router.post("/api/Produtos", Auth.verifyToken ,ProdutoController.criar);
// Retorna o produto pelo ID
router.get("/api/Produtos/:idProduto", Auth.verifyToken ,ProdutoController.buscarPorId);


export { router };