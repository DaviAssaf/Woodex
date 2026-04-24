<?php
require_once __DIR__ . '/env.php';
loadEnv(__DIR__ . '/../../../.env');

$host = getenv('DB_HOST');
$user = getenv('DB_USER');
$password = getenv('DB_PASS');
$db = getenv('DB_NAME');

$conn = new mysqli($host, $user, $password, $db);

if ($conn) {
    printf("Conexão bem-sucedida: %s\n", $conn->host_info);
}

// if ($conn->connect_error) {
//     die("Erro de conexão: " . $conn->connect_error);
// }

// return $conn;