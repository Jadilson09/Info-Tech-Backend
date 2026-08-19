import pg, { type PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Classe que representa a conexão com o banco de dados.
 */
export class DatabaseModel {
  /**
   * Configuração para conexão com o banco de dados
   */
  private _config: PoolConfig;

  /**
   * Pool de conexões com o banco de dados
   */
  private _pool: pg.Pool;

  constructor() {
    // Configuração com portas convertidas para Number e nomes corretos da biblioteca
    this._config = {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432,
      max: 10,
      idleTimeoutMillis: 10000, // Corrigido a grafia (Timeout com 'e')
    };

    // Inicialização apenas do Pool (gerencia conexões automaticamente)
    this._pool = new pg.Pool(this._config);
  }

  /**
   * Método para testar a conexão com o banco de dados usando o próprio Pool.
   *
   * @returns **true** caso a conexão tenha sido feita, **false** caso contrário
   */
  public async testeConexao(): Promise<boolean> {
    try {
      // Pega um cliente temporário do pool para testar e o libera logo em seguida
      const client = await this._pool.connect();
      console.log('Database connected!');
      client.release(); // Libera a conexão de volta para o Pool
      return true;
    } catch (error) {
      console.error('Error to connect database X(');
      console.error(error);
      return false;
    }
  }

  /**
   * Getter para o pool de conexões.
   */
  public get pool(): pg.Pool {
    return this._pool;
  }
}

// Exporta uma instância única (Singleton)
export default new DatabaseModel();