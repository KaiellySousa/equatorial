<?php
session_start();

/*retorna o json */
function retornarJSON($dados = [], $status = 200){
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

/* validação do EMAIL */
function validarEmail($email){
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/* ======================================
   VALIDAR SENHA (mínimo 8 caracteres,
   pelo menos 1 número, 1 letra)
   ====================================== */
function validarSenha($senha){
    if(strlen($senha) < 8) return false;
    if(!preg_match('/[A-Z]/i', $senha)) return false;
    if(!preg_match('/\d/', $senha)) return false;
    return true;
}

/* gerador de tokin seguro*/
function gerarToken($tamanho = 50){
    return bin2hex(random_bytes($tamanho));
}

/* checagem do login */
function checarLogin(){
    if(!isset($_SESSION['usuario_id'])){
        retornarJSON(['error' => 'Usuário não autenticado'], 401);
    }
}

/*formatação da data*/
function formatarData($data, $formato = 'd/m/Y H:i:s'){
    return date($formato, strtotime($data));
}
?>
