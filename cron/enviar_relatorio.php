<?php
// Rodar semanalmente via cron
require '../../includes/conexao.php';
require '../../app/services/EmailService.php';

// Pega relatório da semana
$sql = "SELECT u.nome, n.status, COUNT(*) AS total, DATE(n.data_hora) as dia
        FROM notas n
        JOIN usuarios u ON n.usuario_id=u.id
        WHERE WEEK(n.data_hora) = WEEK(CURDATE())
        GROUP BY u.nome, n.status, dia
        ORDER BY dia DESC";
$res = $conn->query($sql);

$corpo = "<h2>Relatório Semanal de Notas</h2><table border='1'><tr><th>Usuário</th><th>Status</th><th>Total</th><th>Dia</th></tr>";
while($row = $res->fetch_assoc()){
    $corpo .= "<tr><td>{$row['nome']}</td><td>{$row['status']}</td><td>{$row['total']}</td><td>{$row['dia']}</td></tr>";
}
$corpo .= "</table>";

// Lista de e-mails (pode ser de todos administradores)
$emails = ["gestor@empresa.com"]; 

foreach($emails as $email){
    EmailService::enviar($email, "Relatório Semanal", $corpo);
}

echo "Relatório enviado!";
?>
