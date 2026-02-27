<?php
// auth.php — Admin authentication
require_once 'db.php';
$data = getBody();
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    $token = bin2hex(random_bytes(32));
    response(['token' => $token, 'message' => 'Login successful']);
} else {
    response(['error' => 'Invalid credentials'], 401);
}
