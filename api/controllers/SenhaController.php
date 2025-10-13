<?php
include '../includes/conexao.php';
include '../includes/helpers.php';
include '../services/TokenService.php';
include '../services/EmailService.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

// Enviar link de redefinição
if(isset($data['email'])) {
    $email = sanitize($data['email']);
    $token = TokenService::gerarToken();

    $stmt = $conn->prepare("UPDATE usuarios SET token_redefinicao=? WHERE email=?");
    $stmt->bind_param("ss", $token, $email);
    $stmt->execute();

    $link = "http://localhost/projeto-equatorial/redefinir_senha.html?token=$token";
    EmailService::enviar($email, "Redefinição de senha - Equatorial Energia", "Clique no link para redefinir sua senha: $link");

    echo json_encode(['message'=>'Um link foi enviado para seu e-mail.']);
    exit;
}

// Redefinir senha
if(isset($data['token']) && isset($data['senha'])) {
    $token = sanitize($data['token']);
    $senha = password_hash($data['senha'], PASSWORD_DEFAULT);

    $stmt = $conn->prepare("UPDATE usuarios SET senha=?, token_redefinicao=NULL WHERE token_redefinicao=?");
    $stmt->bind_param("ss", $senha, $token);
    $stmt->execute();

    echo json_encode(['message'=>'Senha redefinida com sucesso!']);
    exit;
}
?>
