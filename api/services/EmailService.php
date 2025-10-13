<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/autoload.php';

class EmailService {
    public static function enviar($destino, $assunto, $mensagem){
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.seuservidor.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'no-reply@empresa.com';
            $mail->Password = 'SENHA';
            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            $mail->setFrom('no-reply@empresa.com','Equatorial Energia');
            $mail->addAddress($destino);
            $mail->isHTML(true);
            $mail->Subject = $assunto;
            $mail->Body = $mensagem;

            $mail->send();
        } catch (Exception $e) {
            echo "Erro ao enviar email: {$mail->ErrorInfo}";
        }
    }
}
?>
