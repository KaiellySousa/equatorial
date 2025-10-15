import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function openDb() {
  return open({
    filename: path.join(__dirname, "database.db"),
    driver: sqlite3.Database
  });
}

export async function criarTabelas() {
  const db = await openDb();

  // Tabela de usuários
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    );
  `);

  // Tabela de notas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL,
      regional TEXT NOT NULL,
      instalacao TEXT NOT NULL,
      cliente TEXT NOT NULL,
      stc TEXT NOT NULL,
      status TEXT NOT NULL,
      dificuldade TEXT NOT NULL,
      data_hora TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  console.log("Banco SQLite pronto e tabelas criadas");
}
