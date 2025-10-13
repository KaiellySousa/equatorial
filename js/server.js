import express from "express";
import bcrypt from "bcrypt";
import { openDb, criarTabelas } from "./database.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Configuração para __dirname no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para receber JSON, form-data e servir arquivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // public na raiz do projeto

// Criar tabelas ao iniciar o servidor
await criarTabelas();

// Rotas HTML
app.get("/cadastro.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/cadastro.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Rota de cadastro
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  // Verifica se é e-mail da Equatorial
  if (!email.endsWith("@equatorialenergia.com.br")) {
    return res.status(400).json({ erro: "Somente e-mails @equatorialenergia.com.br são permitidos" });
  }

  try {
    const db = await openDb();
    const senhaHash = await bcrypt.hash(senha, 10); // Criptografa a senha
    await db.run(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, senhaHash]
    );
    res.json({ mensagem: "Cadastro realizado com sucesso!" });
  } catch (erro) {
    res.status(400).json({ erro: "Erro ao cadastrar: e-mail já cadastrado ou dados inválidos." });
  }
});

// Rota de login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const db = await openDb();
    const usuario = await db.get("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (usuario && await bcrypt.compare(senha, usuario.senha)) {
      res.json({ mensagem: "Login realizado com sucesso!", usuario: usuario.nome });
    } else {
      res.status(400).json({ erro: "Email ou senha incorretos" });
    }
  } catch (erro) {
    res.status(500).json({ erro: "Erro no servidor." });
  }
});

// Inicia o servidor
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
