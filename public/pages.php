<?php
session_start();
if (!isset($_SESSION['usuario'])) {
    header("Location: login.html");
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Página Protegida</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<h2>Olá, <?php echo $_SESSION['usuario']; ?> 👋</h2>
<a href="../app/controllers/AuthController.php?acao=logout">Sair</a>
</body>
</html>
