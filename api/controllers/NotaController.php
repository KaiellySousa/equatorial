<?php
session_start();
include('../../includes/conexao.php');

if(!isset($_SESSION['usuario_id'])){
    header("Location: ../../public/login.html");
    exit;
}

if($_SERVER['REQUEST_METHOD']=='POST'){
    $usuario_id = $_SESSION['usuario_id'];
    $regional   = $_POST['regional'];
    $instalacao = $_POST['instalacao'];
    $cliente    = $_POST['cliente'];
    $observacao = $_POST['observacao'];
    $stc        = $_POST['stc'];

    $foto = null;
    if(isset($_FILES['foto']) && $_FILES['foto']['error']==0){
        $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $foto = '../../uploads/'.uniqid().'.'.$ext;
        move_uploaded_file($_FILES['foto']['tmp_name'], $foto);
    }

    $stmt = $conn->prepare("INSERT INTO notas (usuario_id, regional, instalacao, cliente, observacao, stc, foto) VALUES (?,?,?,?,?,?,?)");
    $stmt->bind_param("issssss", $usuario_id,$regional,$instalacao,$cliente,$observacao,$stc,$foto);
    $stmt->execute();
    echo "<script>alert('Nota registrada!'); window.location='../../public/registrar.html';</script>";
}
?>
