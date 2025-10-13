<?php
header('Content-Type: application/json');

try {
    $db = new PDO('sqlite:' . __DIR__ . '/../js/database.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Lê os dados enviados via fetch
    $input = json_decode(file_get_contents('php://input'), true);
    $nome = $input['nome'];
    $email = $input['email'];
    $senha = password_hash($input['senha'], PASSWORD_DEFAULT);

    // Verifica se o e-mail já existe
    $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        echo json_encode(['erro' => 'E-mail já cadastrado.']);
        exit;
    }

    // Insere o novo usuário
    $stmt = $db->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
    $stmt->execute([$nome, $email, $senha]);

    echo json_encode(['mensagem' => 'Usuário cadastrado com sucesso!']);
} catch (Exception $e) {
    echo json_encode(['erro' => 'Erro ao cadastrar: ' . $e->getMessage()]);
}
?>
