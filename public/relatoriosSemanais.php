<?php
session_start();
if(!isset($_SESSION['usuario_id'])) {
    header("Location: login.html");
    exit;
}

$conn = new mysqli("localhost","root","","equatorial");

$sql = "SELECT u.nome, COUNT(*) AS total_notas, SUM(CASE WHEN n.stc='Aprovado' THEN 1 ELSE 0 END) as aprovadas,
        SUM(CASE WHEN n.stc='Reprovado' THEN 1 ELSE 0 END) as reprovadas,
        DATE(n.data_hora) as dia
        FROM notas n
        JOIN usuarios u ON n.usuario_id = u.id
        WHERE WEEK(n.data_hora,1) = WEEK(CURDATE(),1)
        GROUP BY u.nome, dia
        ORDER BY dia DESC";

$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatórios Semanais - Equatorial</title>
<link rel="stylesheet" href="CSS/style.css">
</head>
<body>
<h1>Relatórios Semanais</h1>
<table border="1">
    <tr>
        <th>Usuário</th>
        <th>Total de Notas</th>
        <th>Aprovadas</th>
        <th>Reprovadas</th>
        <th>Data</th>
    </tr>
    <?php while($row = $result->fetch_assoc()): ?>
    <tr>
        <td><?= $row['nome'] ?></td>
        <td><?= $row['total_notas'] ?></td>
        <td><?= $row['aprovadas'] ?></td>
        <td><?= $row['reprovadas'] ?></td>
        <td><?= date('d/m/Y', strtotime($row['dia'])) ?></td>
    </tr>
    <?php endwhile; ?>
</table>
</body>
</html>
