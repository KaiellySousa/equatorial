import { openDb, criarTabelas } from './database.js';

async function teste() {
  await criarTabelas(); // garante que as tabelas existam
  const db = await openDb();

  // mostra todos os usuários cadastrados
  const usuarios = await db.all("SELECT * FROM usuarios");
  console.log("Usuários no banco:", usuarios);

  // opcional: adicionar um usuário de teste
  // await db.run(
  //   "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
  //   ["Teste", "teste@equatorialenergia.com.br", "123"]
  // );
}

teste();
