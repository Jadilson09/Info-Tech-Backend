import { pool } from '../config/index.js';

// Interface do Objeto Categoria
export interface ICategoria {
  id_categoria?: number;
  nome: string;
}

export class CategoriaModel {
  async criar(categoria: ICategoria): Promise<ICategoria> {
    const query = 'INSERT INTO categoria (nome) VALUES ($1) RETURNING *';
    const valores = [categoria.nome.trim()];
    const resultado = await pool.query(query, valores);
    return {
      id_categoria: resultado.rows[0].id_categoria,
      nome: resultado.rows[0].nome,
    };
  }

  async listar(): Promise<ICategoria[]> {
    const query = 'SELECT * FROM categoria ORDER BY id_categoria ASC';
    const resultado = await pool.query(query);
    return resultado.rows.map((row: any) => ({
      id_categoria: row.id_categoria,
      nome: row.nome
    }));
  }

  async buscarPorId(id: number): Promise<ICategoria | null> {
    const query = 'SELECT * FROM categoria WHERE id_categoria = $1';
    const resultado = await pool.query(query, [id]);
    return resultado.rows[0] || null;
    return {
      id_categoria: resultado.rows[0].id_categoria,
      nome: resultado.rows[0].nome,
    };
  }
}

export default new CategoriaModel();