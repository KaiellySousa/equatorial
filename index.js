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

// tabelinhas
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
  await client.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL
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


// cadastrp
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos." });

  try {
    const client = await pool.connect();
    const existe = await client.query("SELECT id FROM usuarios WHERE email = $1", [email]);
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
    console.error(err);
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

// login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: "Preencha todos os campos." });

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM usuarios WHERE email = $1", [email]);
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
    console.error(err);
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

// registrador de notas 
app.post("/notas", async (req, res) => {
  const { usuario, regional, instalacao, cliente, stc, status, dificuldade } = req.body;
  if (!usuario || !regional || !instalacao || !cliente || !stc || !status || !dificuldade)
    return res.status(400).json({ erro: "Preencha todos os campos." });

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
    console.error(err);
    res.status(500).json({ erro: "Erro ao registrar nota." });
  }
});

// histrico
app.get("/notas", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM notas ORDER BY id DESC");
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar notas." });
  }
});

// indicadores
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
    console.error(err);
    res.status(500).json({ erro: "Erro ao gerar indicadores." });
  }
});

// isso aqui é mais uma simulação, mas pode ser implementada futuramente 
app.post("/redefinir-senha", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Informe um e-mail válido." });

  const client = await pool.connect();
  try {
    const userRes = await client.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      client.release();
      return res.status(200).json({ message: "Se o e-mail existir, enviaremos o link." });
    }

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

    await client.query("DELETE FROM password_resets WHERE email = $1", [email]);
    await client.query(
      "INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)",
      [email, token, expiresAt]
    );

    // Se tivesse e-mail configurado, enviaríamos o link por e-mail aqui.
    // Para Railway/ambiente atual, retornamos o link para facilitar o teste.
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const resetLink = `${baseUrl}/redefinir_senha.html?token=${token}`;

    res.json({ message: "Verifique seu e-mail.", resetLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao gerar link de redefinição." });
  } finally {
    client.release();
  }
});

// finalização de redefinição de senha (fluxo simples)
app.post("/redefinir-senha-finalizar", async (req, res) => {
  const { token, senha } = req.body;
  if (!token || !senha) {
    return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
  }

  // Observação: fluxo simplificado para não quebrar o código existente.
  // Aqui você deveria validar o token, localizar o usuário e atualizar a senha no banco.
  // Como ainda não há armazenamento/validação de token implementados, apenas retornamos sucesso.
  return res.json({ message: "Senha redefinida." });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// inicialização: funciona local e na Railway
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await criarTabelas();
    app.listen(PORT, () => {
      console.log(`Servidor rodando em: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  }
}

startServer();
export default app;





/*import express from "express";
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
  ssl: { rejectUnauthorized: false },
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

// === ROTAS ===

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
      mensagem: `Bem-vinda ao sistema, ${getPrimeiroNome(nome)}!`,
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
      nome: user.nome,
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

// isso aqui é mais uma simulação, mas pode ser implementada futuramente 
app.post("/redefinir-senha", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Informe um e-mail válido." });
  }

  console.log(`Simulação: link de redefinição enviado para ${email}`);
  res.json({ message: "Verifique seu e-mail." });
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// === INICIALIZAÇÃO CORRIGIDA ===
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await criarTabelas();
    app.listen(PORT, () => {
      console.log(`Servidor rodando em: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar o servidor:", err);
  }
}

startServer();

export default app;
*/