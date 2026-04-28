<?php

function readEnvFile(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $rows = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    if ($rows === false) {
        throw new RuntimeException('Nao foi possivel ler o arquivo .env.');
    }

    $values = [];

    foreach ($rows as $row) {
        $row = trim($row);

        if ($row === '' || strpos($row, '#') === 0 || strpos($row, '=') === false) {
            continue;
        }

        [$name, $value] = explode('=', $row, 2);

        $name = trim($name);
        $value = trim($value);

        if ($name === '') {
            continue;
        }

        $values[$name] = $value;
    }

    return $values;
}

function loadEnv(string $path): array
{
    $values = readEnvFile($path);

    foreach ($values as $name => $value) {
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }

    return $values;
}
