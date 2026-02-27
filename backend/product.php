<?php
// product.php — Product CRUD API
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$featured = $_GET['featured'] ?? null;
$limit = (int)($_GET['limit'] ?? 100);
$category = $_GET['category'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? AND active = 1");
            $stmt->execute([$id]);
            $product = $stmt->fetch();
            if ($product) response(['product' => $product]);
            else response(['error' => 'Product not found'], 404);
        } else {
            $where = ['active = 1'];
            $params = [];
            if ($featured) { $where[] = 'featured = 1'; }
            if ($category) { $where[] = 'category = ?'; $params[] = $category; }
            $whereStr = implode(' AND ', $where);
            $stmt = $pdo->prepare("SELECT * FROM products WHERE $whereStr ORDER BY id DESC LIMIT $limit");
            $stmt->execute($params);
            $products = $stmt->fetchAll();
            response(['products' => $products, 'total' => count($products)]);
        }
        break;

    case 'POST':
        $data = getBody();
        $stmt = $pdo->prepare("INSERT INTO products (name, category, price, original_price, stock, emoji, image, description, care, featured) VALUES (?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([
            $data['name'], $data['category'], $data['price'],
            $data['original_price'] ?? null, $data['stock'] ?? 0,
            $data['emoji'] ?? null, $data['image'] ?? null,
            $data['description'] ?? null, $data['care'] ?? null,
            $data['featured'] ?? 0
        ]);
        response(['id' => $pdo->lastInsertId(), 'message' => 'Product created'], 201);
        break;

    case 'PUT':
        if (!$id) response(['error' => 'ID required'], 400);
        $data = getBody();
        $fields = [];
        $params = [];
        $allowed = ['name','category','price','original_price','stock','emoji','image','description','care','featured','active'];
        foreach ($allowed as $field) {
            if (isset($data[$field])) { $fields[] = "$field = ?"; $params[] = $data[$field]; }
        }
        if (empty($fields)) response(['error' => 'No fields to update'], 400);
        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);
        response(['message' => 'Product updated']);
        break;

    case 'DELETE':
        if (!$id) response(['error' => 'ID required'], 400);
        $stmt = $pdo->prepare("UPDATE products SET active = 0 WHERE id = ?");
        $stmt->execute([$id]);
        response(['message' => 'Product deleted']);
        break;

    default:
        response(['error' => 'Method not allowed'], 405);
}
