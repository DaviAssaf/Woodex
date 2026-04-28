<?php

session_start();

class AuthenticationException extends RuntimeException
{
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

set_exception_handler(static function (Throwable $exception): void {
    $statusCode = 500;

    if ($exception instanceof AuthenticationException) {
        $statusCode = 401;
    } elseif ($exception instanceof InvalidArgumentException) {
        $statusCode = 422;
    } elseif (strpos($exception->getMessage(), 'nao encontrado') !== false) {
        $statusCode = 404;
    }

    if (!headers_sent()) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
    }

    echo json_encode([
        'success' => false,
        'message' => $exception->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
});

register_shutdown_function(static function (): void {
    $error = error_get_last();

    if ($error === null) {
        return;
    }

    $fatalErrors = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR];

    if (!in_array($error['type'], $fatalErrors, true)) {
        return;
    }

    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }

    echo json_encode([
        'success' => false,
        'message' => 'Erro fatal no backend: ' . $error['message'],
    ], JSON_UNESCAPED_UNICODE);
});

require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/EspecieController.php';

$authController = new AuthController();
$controller = new EspecieController();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method === 'GET') {
    $action = strtolower((string) ($_GET['action'] ?? ''));

    if ($action === 'status') {
        echo json_encode([
            'success' => true,
            'data' => $controller->checkConnection(),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'session') {
        echo json_encode([
            'success' => true,
            'authenticated' => $authController->isAuthenticated(),
            'user' => $authController->getAuthenticatedUser(),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $authController->requireAuthentication();

    echo json_encode($controller->getAll(), JSON_UNESCAPED_UNICODE);
    exit;
}

$payload = getRequestPayload();
$action = resolveAction($method, $payload);

switch ($action) {
    case 'login':
        $username = (string) ($payload['username'] ?? '');
        $password = (string) ($payload['password'] ?? '');
        $user = $authController->login($username, $password);
        echo json_encode([
            'success' => true,
            'message' => 'Login realizado com sucesso.',
            'user' => $user,
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'logout':
        $authController->logout();
        echo json_encode([
            'success' => true,
            'message' => 'Sessao encerrada com sucesso.',
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'add':
        $authController->requireAuthentication();
        $especie = normalizeEspecie($payload['especie'] ?? null);
        $created = $controller->add($especie);
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'data' => $created,
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'update':
        $authController->requireAuthentication();
        $id = resolveId($payload['id'] ?? null);
        $especie = normalizeEspecie($payload['especie'] ?? null);
        $updated = $controller->update($id, $especie);
        echo json_encode([
            'success' => true,
            'data' => $updated,
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'delete':
        $authController->requireAuthentication();
        $id = resolveId($payload['id'] ?? null);
        $controller->delete($id);
        echo json_encode([
            'success' => true,
            'message' => 'Registro removido com sucesso.',
        ], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Metodo ou acao nao suportados.',
        ], JSON_UNESCAPED_UNICODE);
        break;
}

function getRequestPayload(): array
{
    $payload = $_POST;

    if (!empty($payload)) {
        return $payload;
    }

    $rawBody = file_get_contents('php://input');

    if (!is_string($rawBody) || trim($rawBody) === '') {
        return [];
    }

    $decoded = json_decode($rawBody, true);

    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return $decoded;
    }

    parse_str($rawBody, $parsed);

    return is_array($parsed) ? $parsed : [];
}

function resolveAction(string $method, array $payload): string
{
    $action = strtolower((string) ($payload['action'] ?? ''));

    if ($action !== '') {
        return $action;
    }

    if ($method === 'POST') {
        return 'add';
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        return 'update';
    }

    if ($method === 'DELETE') {
        return 'delete';
    }

    return '';
}

function normalizeEspecie($especie): array
{
    if (is_string($especie)) {
        $decoded = json_decode($especie, true);

        if (json_last_error() === JSON_ERROR_NONE) {
            $especie = $decoded;
        }
    }

    if (!is_array($especie)) {
        throw new InvalidArgumentException('Payload da especie invalido.');
    }

    return $especie;
}

function resolveId($id): int
{
    if ($id === null || $id === '') {
        throw new InvalidArgumentException('ID nao informado.');
    }

    return (int) $id;
}
