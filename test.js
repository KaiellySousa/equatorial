import { openDb, criarTabelas } from "./js/database.js";

async function testeBanco() {
  try {
    // Criar tabelas (vai criar se ainda não existirem)
    await criarTabelas();

    // Abrir banco
    const db = await openDb();

    // Inserir usuário de teste
    await db.run(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      ["Teste", "teste@equatorialenergia.com.br", "123456"]
    );

    // Buscar usuário
    const user = await db.get(
      "SELECT * FROM usuarios WHERE email = ?",
      ["teste@equatorialenergia.com.br"]
    );

    console.log("Usuário cadastrado com sucesso:");
    console.log(user);
  } catch (erro) {
    console.error("Erro no teste do banco:", erro);
  }
}

testeBanco();
