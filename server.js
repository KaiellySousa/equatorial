import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import { openDb, criarTabelas } from "./js/database.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

await criarTabelas();

function getPrimeiroNome(nome) {
  return nome.split(" ")[0];
}

// === 🔹 CRIA TABELAS SE NÃO EXISTIREM ===
(async () => {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT,
      regional TEXT,
      instalacao TEXT,
      cliente TEXT,
      stc TEXT,
      status TEXT,
      dificuldade TEXT,
      data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Banco de dados pronto!");
})();

// === 🔹 CADASTRO ===
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos!" });

  try {
    const db = await openDb();
    const existe = await db.get("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe) return res.status(400).json({ erro: "E-mail já cadastrado!" });

    const senhaHash = await bcrypt.hash(senha, 10);
    await db.run("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, senhaHash]);
    res.json({
      sucesso: true,
      titulo: "Cadastro realizado!",
      mensagem: `Bem-vinda ao sistema, ${getPrimeiroNome(nome)}!`
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

// === 🔹 LOGIN ===
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos!" });

  try {
    const db = await openDb();
    const user = await db.get("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (!user || !(await bcrypt.compare(senha, user.senha)))
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });

    res.json({
      sucesso: true,
      titulo: "Bem-vinda de volta!",
      mensagem: `Olá, ${getPrimeiroNome(user.nome)}!`,
      nome: user.nome
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

// === 🔹 REGISTRAR NOTA ===
app.post("/notas", async (req, res) => {
  const { usuario, regional, instalacao, cliente, stc, status, dificuldade } = req.body;
  if (!usuario || !regional || !instalacao || !cliente || !stc || !status || !dificuldade)
    return res.status(400).json({ erro: "Preencha todos os campos." });

  try {
    const db = await openDb();
    await db.run(
      `INSERT INTO notas (usuario, regional, instalacao, cliente, stc, status, dificuldade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario, regional, instalacao, cliente, stc, status, dificuldade]
    );
    res.json({ sucesso: true, mensagem: "Nota registrada com sucesso!" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao registrar nota." });
  }
});

// === 🔹 LISTAR NOTAS ===
app.get("/notas", async (req, res) => {
  try {
    const db = await openDb();
    const notas = await db.all("SELECT * FROM notas ORDER BY id DESC");
    res.json(notas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar notas." });
  }
});

// === 🔹 INDICADORES (por dificuldade) ===
app.get("/indicadores", async (req, res) => {
  try {
    const db = await openDb();
    const result = await db.all(`
      SELECT dificuldade, COUNT(*) as total
      FROM notas
      GROUP BY dificuldade
    `);
    res.json(result);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar indicadores." });
  }
});

// === 🔹 ROTA PRINCIPAL (login.html) ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// === 🔹 START SERVER ===
app.listen(3000, () =>
  console.log("Servidor rodando em: http://localhost:3000")
);
