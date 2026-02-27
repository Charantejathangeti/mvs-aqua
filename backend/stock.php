<?php
// stock.php — Stock update API
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, name, category, stock, emoji FROM products WHERE active=1 ORDER BY name");
        response(['stock' => $stmt->fetchAll()]);
        break;
    case 'PUT':
        if (!$id) response(['error'=>'ID required'],400);
        $d = getBody();
        if (!isset($d['stock'])) response(['error'=>'stock required'],400);
        $pdo->prepare("UPDATE products SET stock=? WHERE id=?")->execute([(int)$d['stock'], $id]);
        response(['message'=>'Stock updated']);
        break;
    default: response(['error'=>'Method not allowed'],405);
}
