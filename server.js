// server.js — Equatorial Piauí

import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const { Pool } = pkg;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function criarTabelas() {
  const client = await pool.connect();
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
      usuario TEXT,
      regional TEXT,
      instalacao TEXT,
      cliente TEXT,
      stc TEXT,
      status TEXT,
      dificuldade TEXT,
      data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  client.release();
  console.log("Banco PostgreSQL conectado e tabelas criadas!");
}

function getPrimeiroNome(nome) {
  return nome.split(" ")[0];
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

await criarTabelas();

app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos." });

  try {
    const client = await pool.connect();
    const existe = await client.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );
    if (existe.rows.length > 0) {
      client.release();
      return res.status(400).json({ erro: "E-mail já cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await client.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)",
      [nome, email, senhaHash]
    );
    client.release();
    res.json({
      sucesso: true,
      titulo: "Cadastro realizado",
      mensagem: `Bem-vinda ao sistema, ${getPrimeiroNome(nome)}!`
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos." });

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    client.release();

    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    res.json({
      sucesso: true,
      titulo: "Bem-vinda de volta",
      mensagem: `Olá, ${getPrimeiroNome(user.nome)}!`,
      nome: user.nome
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

app.post("/notas", async (req, res) => {
  const { usuario, regional, instalacao, cliente, stc, status, dificuldade } =
    req.body;
  if (
    !usuario ||
    !regional ||
    !instalacao ||
    !cliente ||
    !stc ||
    !status ||
    !dificuldade
  ) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO notas (usuario, regional, instalacao, cliente, stc, status, dificuldade)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [usuario, regional, instalacao, cliente, stc, status, dificuldade]
    );
    client.release();
    res.json({ sucesso: true, mensagem: "Nota registrada com sucesso." });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao registrar nota." });
  }
});

app.get("/notas", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM notas ORDER BY id DESC");
    client.release();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar notas." });
  }
});

app.get("/indicadores", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT dificuldade, COUNT(*) as total
      FROM notas
      GROUP BY dificuldade
    `);
    client.release();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar indicadores." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando em: http://localhost:${PORT}`)
);

export default app;
