import dotenv from "dotenv";
dotenv.config();
console.log("URL do banco:", process.env.DATABASE_URL);

import pg from "pg";

const { Pool } = pg;

// conexão com o banco PostgreSQL do Railway
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

export async function criarTabelas() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notas (
        id SERIAL PRIMARY KEY,
        usuario TEXT NOT NULL,
        regional TEXT NOT NULL,
        instalacao TEXT NOT NULL,
        cliente TEXT NOT NULL,
        stc TEXT NOT NULL,
        status TEXT NOT NULL,
        dificuldade TEXT NOT NULL,
        data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Banco PostgreSQL conectado e tabelas criadas!");
  } catch (err) {
    console.error("Erro ao criar tabelas:", err);
  } finally {
    client.release();
  }
}
export async function openDb() {
  return pool;
}
