<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    // conecta ao banco SQLite
    $db = new PDO('sqlite:' . __DIR__ . '/../js/database.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // lê o JSON enviado via fetch()
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['nome']) || empty($data['email']) || empty($data['senha'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'Preencha todos os campos.']);
        exit;
    }

    $nome  = trim($data['nome']);
    $email = trim($data['email']);
    $senha = password_hash($data['senha'], PASSWORD_DEFAULT);

    // impede cadastro duplicado
    $stmt = $db->prepare("SELECT COUNT(*) FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        http_response_code(409); // conflito
        echo json_encode(['erro' => 'E-mail já cadastrado.']);
        exit;
    }

    // insere usuário
    $stmt = $db->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
    $stmt->execute([$nome, $email, $senha]);

    echo json_encode([
        'status' => 'ok',
        'mensagem' => 'Usuário cadastrado com sucesso!'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro no servidor: ' . $e->getMessage()]);
}
?>
