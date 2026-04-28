<?php

require_once __DIR__ . '/env.php';

$databaseConfigFile = __DIR__ . '/../../config/database.php';
$config = [];

if (is_file($databaseConfigFile)) {
    $databaseConfig = require $databaseConfigFile;

    if (!is_array($databaseConfig)) {
        throw new RuntimeException('Arquivo server/config/database.php invalido.');
    }

    $config = array_merge($config, $databaseConfig);
}

$envPaths = [
    __DIR__ . '/../../../.env',
    __DIR__ . '/../../.env',
];

$envLoaded = false;

foreach ($envPaths as $envPath) {
    if (is_file($envPath)) {
        $config = array_merge($config, readEnvFile($envPath));
        $envLoaded = true;
        break;
    }
}

if (!$envLoaded && empty($config)) {
    throw new RuntimeException('Variaveis do banco nao foram encontradas. Use server/config/database.php ou um arquivo .env.');
}

$host = (string) ($config['DB_HOST'] ?? $_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? '');
$user = (string) ($config['DB_USER'] ?? $_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? '');
$password = (string) ($config['DB_PASS'] ?? $_ENV['DB_PASS'] ?? $_SERVER['DB_PASS'] ?? '');
$database = (string) ($config['DB_NAME'] ?? $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? '');

if ($host === '' || $user === '' || $database === '') {
    throw new RuntimeException('Variaveis de ambiente do banco nao configuradas corretamente.');
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$conn = null;

try {
    $conn = new mysqli($host, $user, $password, $database);
} catch (mysqli_sql_exception $exception) {
    throw new RuntimeException('Falha ao conectar no banco de dados: ' . $exception->getMessage(), 0, $exception);
}

$conn->set_charset('utf8mb4');

return $conn;
