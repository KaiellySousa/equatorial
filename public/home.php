<?php
session_start();
if (!isset($_SESSION['usuario_id'])) {
  header("Location: login.html");
  exit;
}
$nome = htmlspecialchars($_SESSION['usuario_nome']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Home — Equatorial Piauí</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header class="navbar">
  <div class="logo">
    <img src="assets/imagens/equatorial_energia.png" alt="Logo Equatorial">
  </div>
  <nav>
    <a href="registrar.html">Registrar</a>
    <a href="historico.html">Histórico</a>
    <a href="../app/controllers/LogoutController.php">Sair</a>
  </nav>
</header>

<main class="container">
  <h1>Olá, <?= $nome ?> 👋</h1>
  <p>Bem-vindo ao sistema Equatorial Piauí!</p>
</main>
</body>
</html>
