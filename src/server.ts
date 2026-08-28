import app from './app.js';
import db from './model/DatabaseModel.js';

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    const conexaoOk = await db.testeConexao();
    if (!conexaoOk) {
      console.error('Falha ao conectar no PostgreSQL. Encerrando aplicação.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error('Erro ao inicializar o banco ou servidor:', erro);
    process.exit(1);
  }
}

iniciarServidor();