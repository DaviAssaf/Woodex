<?php
header('Content-Type: application/json');

require_once __DIR__ . '/controllers/EspecieController.php';

$controller = new EspecieController();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($controller->getAll());
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'add') {
        $especie = json_decode($_POST['especie'], true);
        $controller->add($especie);
    } elseif ($action === 'update') {
        $id = (int)($_POST['id'] ?? -1);
        $especie = json_decode($_POST['especie'], true);
        $controller->update($id, $especie);
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? -1);
        $controller->delete($id);
    }
    echo json_encode(['success' => true]);
} else {
    http_response_code(405);
}
?></content>
<parameter name="filePath">c:\Arq_Doc\Woodex\src\api.php