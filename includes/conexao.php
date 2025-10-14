<?php
try {
    // Caminho fixo para o banco dentro da pasta js
    $dbPath = realpath(__DIR__ . '/../js/database.db');

    // Se o arquivo ainda não existir, cria na pasta js
    if (!$dbPath) {
        $dir = __DIR__ . '/../js';
        if (!is_dir($dir)) mkdir($dir, 0777, true);
        $dbPath = $dir . '/database.db';
    }

    // Conecta ao SQLite
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Cria a tabela se ainda não existir
    $db->exec("
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        )
    ");

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao conectar ao banco: ' . $e->getMessage()]);
    exit;
}
?>
