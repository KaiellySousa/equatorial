import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function openDb() {
  return open({
    filename: path.join(__dirname, "database.db"), // vai criar o banco dentro da pasta js
    driver: sqlite3.Database
  });
}

export async function criarTabelas() {
  const db = await openDb();
  await db.exec(`
   CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    token_redefinicao VARCHAR(255)
);


    CREATE TABLE IF NOT EXISTS notas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      cliente TEXT,
      status TEXT,
      data_hora TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    );
  `);
  console.log("Tabelas criadas ou já existentes");
}
