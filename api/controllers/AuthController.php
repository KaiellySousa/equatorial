<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");
session_start();
require_once('../../includes/conexao.php');

// === LOGIN ===
if (isset($_POST['acao']) && $_POST['acao'] === 'login') {
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';

    $stmt = $conn->prepare("SELECT id, nome, senha FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 1) {
        $usuario = $res->fetch_assoc();
        if (password_verify($senha, $usuario['senha'])) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nome'] = $usuario['nome'];

            echo "<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
            <script>
              Swal.fire({
                icon:'success',
                title:'Login realizado com sucesso!',
                timer:1200,
                showConfirmButton:false
              }).then(()=>window.location='../../public/home.php');
            </script>";
            exit;
        }
    }

    // erro de login
    echo "<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
    <script>
      Swal.fire({icon:'error',title:'E-mail ou senha incorretos!'});
      setTimeout(()=>window.location='../../public/login.html',1300);
    </script>";
    exit;
}

// === CADASTRO ===
if (isset($_POST['acao']) && $_POST['acao'] === 'cadastro') {
    $nome  = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

    // verifica se já existe
    $check = $conn->prepare("SELECT id FROM usuarios WHERE email=?");
    $check->bind_param("s", $email);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        echo "<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
        <script>
          Swal.fire({icon:'warning',title:'E-mail já cadastrado!'});
          setTimeout(()=>window.location='../../public/cadastro.html',1200);
        </script>";
        exit;
    }

    // insere novo usuário
    $stmt = $conn->prepare("INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)");
    $stmt->bind_param("sss", $nome, $email, $senha);
    $stmt->execute();

    echo "<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
    <script>
      Swal.fire({
        icon:'success',
        title:'Cadastro realizado!',
        timer:1200,
        showConfirmButton:false
      }).then(()=>window.location='../../public/login.html');
    </script>";
    exit;
}
?>
