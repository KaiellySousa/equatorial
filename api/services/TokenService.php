<?php
class TokenService {
    public static function gerarToken($tamanho = 50) {
        return bin2hex(random_bytes($tamanho));
    }
}
?>
