<?php
// order.php — Order management API
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch();
            if (!$order) response(['error' => 'Order not found'], 404);
            $stmt2 = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmt2->execute([$id]);
            $order['items'] = $stmt2->fetchAll();
            response(['order' => $order]);
        } else {
            $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200");
            $orders = $stmt->fetchAll();
            response(['orders' => $orders, 'total' => count($orders)]);
        }
        break;

    case 'POST':
        $data = getBody();
        $orderId = 'ORD' . time() . rand(10,99);
        $subtotal = $data['subtotal'] ?? 0;
        $delivery = $data['delivery'] ?? 0;
        $total = $data['total'] ?? ($subtotal + $delivery);

        $stmt = $pdo->prepare("INSERT INTO orders (id, customer_name, phone, address, subtotal, delivery, total, status, notes) VALUES (?,?,?,?,?,?,?,'pending',?)");
        $stmt->execute([$orderId, $data['customer_name'], $data['phone'] ?? null, $data['address'] ?? null, $subtotal, $delivery, $total, $data['notes'] ?? null]);

        // Insert order items
        if (!empty($data['items'])) {
            $itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, price, qty) VALUES (?,?,?,?,?)");
            foreach ($data['items'] as $item) {
                $itemStmt->execute([$orderId, $item['id'] ?? null, $item['name'], $item['price'], $item['qty']]);
            }
        }
        response(['order_id' => $orderId, 'message' => 'Order created'], 201);
        break;

    case 'PUT':
        if (!$id) response(['error' => 'ID required'], 400);
        $data = getBody();
        $fields = [];
        $params = [];
        $allowed = ['status','tracking_number','courier','notes'];
        foreach ($allowed as $field) {
            if (isset($data[$field])) { $fields[] = "$field = ?"; $params[] = $data[$field]; }
        }
        if (empty($fields)) response(['error' => 'No fields to update'], 400);
        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);
        response(['message' => 'Order updated']);
        break;

    default:
        response(['error' => 'Method not allowed'], 405);
}
