<?php
header('Content-Type: application/json');

try {
    $db = new PDO('sqlite:' . __DIR__ . '/../js/database.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'];
    $senha = $input['senha'];

    $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($senha, $user['senha'])) {
        echo json_encode(['mensagem' => 'Login bem-sucedido!','nome'=>$user['nome']]);
    } else {
        echo json_encode(['erro' => 'E-mail ou senha incorretos.']);
    }
} catch (Exception $e) {
    echo json_encode(['erro' => 'Erro ao fazer login: ' . $e->getMessage()]);
}
?>
