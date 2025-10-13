<?php
include('../../includes/conexao.php');

header('Content-Type: application/json');

$acao = $_GET['acao'] ?? '';

if($acao=='historico'){
    $sql = "SELECT n.id, u.nome AS usuario, n.regional, n.instalacao, n.cliente, n.stc, n.status, n.data_hora
            FROM notas n
            JOIN usuarios u ON n.usuario_id=u.id
            ORDER BY n.data_hora DESC";
    $res = $conn->query($sql);
    $notas = [];
    while($row = $res->fetch_assoc()) $notas[] = $row;
    echo json_encode($notas);
}

if($acao=='semanal'){
    $sql = "SELECT u.nome, n.status, COUNT(*) AS total, DATE(n.data_hora) as dia
            FROM notas n
            JOIN usuarios u ON n.usuario_id=u.id
            WHERE WEEK(n.data_hora) = WEEK(CURDATE())
            GROUP BY u.nome, n.status, dia
            ORDER BY dia DESC";
    $res = $conn->query($sql);
    $rel = [];
    while($row = $res->fetch_assoc()) $rel[] = $row;
    echo json_encode($rel);
}
?>
