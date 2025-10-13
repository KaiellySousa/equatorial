<?php
class Nota {
    public $id;
    public $usuario_id;
    public $regional;
    public $instalacao;
    public $cliente;
    public $observacao;
    public $stc;
    public $foto;
    public $status;
    public $data_hora;

    public function __construct($id, $usuario_id, $regional, $instalacao, $cliente, $observacao, $stc, $foto, $status, $data_hora) {
        $this->id = $id;
        $this->usuario_id = $usuario_id;
        $this->regional = $regional;
        $this->instalacao = $instalacao;
        $this->cliente = $cliente;
        $this->observacao = $observacao;
        $this->stc = $stc;
        $this->foto = $foto;
        $this->status = $status;
        $this->data_hora = $data_hora;
    }
}
?>
