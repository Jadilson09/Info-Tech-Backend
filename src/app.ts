import { DatabaseModel } from "./model/DatabaseModel.js";
import { server } from "./server.js";
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); 
app.use(express.json());

const port: number = Number(process.env.PORT) || 3333; //Define a porta que o servidor vai executar

// Testa conexão com o banco e inicia o servidor apenas uma vez
new DatabaseModel().testeConexao().then((resbd) => {
    if (resbd) {
        console.log('Conexão com o banco estabelecida');
    } else {
        console.log('Não foi possível conectar ao banco de dados (continuando sem DB)');
    }

    server.listen(port, () => {
        console.log(`Servidor executando no endereço: http://localhost:${port}`);
    });
});