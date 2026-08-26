import express from "express"; //Importa o pacote express
import cors from "cors"; //Importa o pacote CORS
import { router } from "./routes.js" //Importa a configuração das rotas

const server = express(); //Cria um servidor HTTP
server.use(cors()); //Configura o servidor para usar o CORS
server.use(express.json()); //Configura o servidor para usar o JSON

// Log simples de todas as requisições para depuração
server.use((req, res, next) => {
	console.log('REQ', req.method, req.url);
	next();
});

// Middleware para tratar JSON inválido e retornar 400 com mensagem clara
server.use((err: any, req: any, res: any, next: any) => {
	// body-parser lança SyntaxError sem a propriedade `status` em alguns cenários;
	// checamos a mensagem para detectar erro de parse JSON
	if (err && err instanceof SyntaxError && /JSON/.test(err.message) && 'body' in err) {
		console.error('JSON parse error:', err.message);
		return res.status(400).json({ erro: 'JSON inválido no body da requisição' });
	}
	return next(err);
});

// Rota de teste POST /api que ecoa o body (útil para depuração rápida)
server.post('/api', (req, res) => {
	return res.status(200).json({ recebido: req.body });
});

server.use(router); //Adiciona as rotas ao servidor HTTP

// Handler de erro global (sempre por último) — evita expor stack traces ao cliente
server.use((err: any, req: any, res: any, next: any) => {
	console.error('Unhandled error:', err);
	if (res.headersSent) {
		return next(err);
	}
	return res.status(500).json({ erro: 'Erro interno no servidor.' });
});

export { server }; //Exporta o servidor