<?php
session_start();
include('../../includes/conexao.php');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $acao = $_POST['acao'];

    if($acao === 'login'){
        $email = $_POST['email'];
        $senha = $_POST['senha'];

        $stmt = $conn->prepare("SELECT id, nome, senha FROM usuarios WHERE email=?");
        $stmt->bind_param("s",$email);
        $stmt->execute();
        $res = $stmt->get_result();

        if($res->num_rows > 0){
            $usuario = $res->fetch_assoc();
            if(password_verify($senha, $usuario['senha'])){
                $_SESSION['usuario_id'] = $usuario['id'];
                $_SESSION['usuario'] = $usuario['nome'];
                header("Location: ../../public/pages.php");
                exit();
            }
        }
        echo "<script>alert('Email ou senha incorretos'); window.location='../../public/login.html';</script>";
    }

    if($acao === 'cadastro'){
        $nome  = $_POST['nome'];
        $email = $_POST['email'];
        $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)");
        $stmt->bind_param("sss",$nome,$email,$senha);
        if($stmt->execute()){
            echo "<script>alert('Cadastro realizado!'); window.location='../../public/login.html';</script>";
        }else{
            echo "Erro: ".$conn->error;
        }
    }
}
?>
