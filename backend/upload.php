<?php
// upload.php — Image upload handler
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') response(['error' => 'POST only'], 405);
if (empty($_FILES['image'])) response(['error' => 'No file uploaded'], 400);

$file = $_FILES['image'];
$allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
if (!in_array($file['type'], $allowed)) response(['error' => 'Invalid file type'], 400);
if ($file['size'] > 5*1024*1024) response(['error' => 'File too large (max 5MB)'], 400);

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_') . '.' . $ext;
$uploadDir = '../uploads/products/';

if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
$path = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $path)) {
    $url = '/uploads/products/' . $filename;
    response(['url' => $url, 'message' => 'Upload successful']);
} else {
    response(['error' => 'Upload failed'], 500);
}
