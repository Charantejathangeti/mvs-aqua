<?php
// tracking.php — Order tracking API
require_once 'db.php';
$orderId = $_GET['order_id'] ?? null;
if (!$orderId) response(['error'=>'order_id required'],400);

$stmt = $pdo->prepare("SELECT o.*, GROUP_CONCAT(CONCAT(oi.product_name,',',oi.qty,',',oi.price) SEPARATOR '|') as items_raw FROM orders o LEFT JOIN order_items oi ON o.id=oi.order_id WHERE o.id=? GROUP BY o.id");
$stmt->execute([$orderId]);
$order = $stmt->fetch();
if (!$order) response(['error'=>'Order not found'],404);

// Parse items
$order['items'] = [];
if ($order['items_raw']) {
    foreach (explode('|',$order['items_raw']) as $raw) {
        [$name,$qty,$price] = explode(',',$raw);
        $order['items'][] = ['name'=>$name,'qty'=>(int)$qty,'price'=>(float)$price];
    }
}
unset($order['items_raw']);

response([
    'order' => $order,
    'tracking_number' => $order['tracking_number'],
    'courier' => $order['courier']
]);
