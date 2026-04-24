<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Se for uma requisição OPTIONS (preflight), encerra aqui
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}
