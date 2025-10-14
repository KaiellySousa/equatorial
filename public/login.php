<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    // abre o banco SQLite
    $db = new PDO('sqlite:' . __DIR__ . '/../js/database.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // lê os dados JSON enviados
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['email']) || empty($data['senha'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Preencha todos os campos.']);
        exit;
    }

    $email = trim($data['email']);
    $senha = $data['senha'];

    // busca usuário pelo e-mail
    $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // verifica senha
    if ($user && password_verify($senha, $user['senha'])) {
        // cria sessão
        $_SESSION['usuario_id'] = $user['id'];
        $_SESSION['usuario_nome'] = $user['nome'];

        echo json_encode([
            'status' => 'ok',
            'mensagem' => 'Login realizado com sucesso!',
            'nome' => $user['nome']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['erro' => 'E-mail ou senha incorretos.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
