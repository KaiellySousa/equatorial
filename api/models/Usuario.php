<?php
class Usuario {
    public $id;
    public $nome;
    public $email;
    public $senha;
    public $token_redefinicao;

    public function __construct($id, $nome, $email, $senha, $token_redefinicao = null) {
        $this->id = $id;
        $this->nome = $nome;
        $this->email = $email;
        $this->senha = $senha;
        $this->token_redefinicao = $token_redefinicao;
    }
}
?>
