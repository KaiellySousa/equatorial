<?php
class Relatorio {
    public $usuario;
    public $regional;
    public $cliente;
    public $observacoes;
    public $status;
    public $data_hora;
    public $totalNotas;

    public function __construct($usuario, $regional, $cliente, $observacoes, $status, $data_hora, $totalNotas = 0) {
        $this->usuario = $usuario;
        $this->regional = $regional;
        $this->cliente = $cliente;
        $this->observacoes = $observacoes;
        $this->status = $status;
        $this->data_hora = $data_hora;
        $this->totalNotas = $totalNotas;
    }

    // Método para buscar relatório semanal por usuário
    public static function relatorioSemanal($conn) {
        $sql = "SELECT u.nome AS usuario,
                       n.regional,
                       n.cliente,
                       n.observacao AS observacoes,
                       n.stc AS status,
                       DATE(n.data_hora) AS data_hora,
                       COUNT(*) AS totalNotas
                  FROM notas n
                  JOIN usuarios u ON n.usuario_id = u.id
                 WHERE WEEK(n.data_hora) = WEEK(CURDATE())
                 GROUP BY u.nome, n.regional, n.cliente, n.stc, DATE(n.data_hora)
                 ORDER BY totalNotas DESC, u.nome";

        $result = $conn->query($sql);
        $relatorios = [];

        while($row = $result->fetch_assoc()) {
            $relatorios[] = new Relatorio(
                $row['usuario'],
                $row['regional'],
                $row['cliente'],
                $row['observacoes'],
                $row['status'],
                $row['data_hora'],
                $row['totalNotas']
            );
        }

        return $relatorios;
    }
}
?>
