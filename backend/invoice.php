<?php
// invoice.php — Invoice API
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
switch ($method) {
    case 'GET':
        if ($id) {
            $stmt=$pdo->prepare("SELECT * FROM invoices WHERE id=?"); $stmt->execute([$id]);
            $inv=$stmt->fetch(); if (!$inv) response(['error'=>'Not found'],404);
            $inv['items']=json_decode($inv['items'],true);
            response(['invoice'=>$inv]);
        } else {
            $stmt=$pdo->query("SELECT * FROM invoices ORDER BY created_at DESC LIMIT 100");
            response(['invoices'=>$stmt->fetchAll()]);
        }
        break;
    case 'POST':
        $d=getBody();
        $invId=$d['id']??('INV'.time());
        $stmt=$pdo->prepare("INSERT INTO invoices (id,order_id,customer_name,phone,address,items,subtotal,delivery,discount,amount,date) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$invId,$d['order_id']??null,$d['customer_name'],$d['phone']??null,$d['address']??null,json_encode($d['items']??[]),$d['subtotal']??0,$d['delivery']??0,$d['discount']??0,$d['amount']??0,$d['date']??date('Y-m-d')]);
        response(['id'=>$invId,'message'=>'Invoice created'],201);
        break;
    default: response(['error'=>'Method not allowed'],405);
}
