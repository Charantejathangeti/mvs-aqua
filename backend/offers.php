<?php
// offers.php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM offers WHERE active = 1 ORDER BY id DESC");
        response(['offers' => $stmt->fetchAll()]);
        break;
    case 'POST':
        $d = getBody();
        $stmt = $pdo->prepare("INSERT INTO offers (title, description, discount_pct, code, emoji, active) VALUES (?,?,?,?,?,?)");
        $stmt->execute([$d['title'],$d['description']??null,$d['discount_pct']??0,$d['code']??null,$d['emoji']??'🎁',$d['active']??1]);
        response(['id' => $pdo->lastInsertId(), 'message' => 'Offer created'], 201);
        break;
    case 'PUT':
        if (!$id) response(['error'=>'ID required'],400);
        $d = getBody();
        $fields=[]; $params=[];
        foreach (['title','description','discount_pct','code','emoji','active'] as $f) {
            if (isset($d[$f])) { $fields[]="$f=?"; $params[]=$d[$f]; }
        }
        $params[]=$id;
        $pdo->prepare("UPDATE offers SET ".implode(',',$fields)." WHERE id=?")->execute($params);
        response(['message'=>'Offer updated']);
        break;
    case 'DELETE':
        if (!$id) response(['error'=>'ID required'],400);
        $pdo->prepare("DELETE FROM offers WHERE id=?")->execute([$id]);
        response(['message'=>'Offer deleted']);
        break;
    default: response(['error'=>'Method not allowed'],405);
}
