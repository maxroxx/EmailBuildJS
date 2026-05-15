<?php
declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload an image file.']);
    exit;
}

$allowedTypes = [
    'image/gif' => 'gif',
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

$mimeType = mime_content_type($_FILES['image']['tmp_name']);
if (!isset($allowedTypes[$mimeType])) {
    http_response_code(400);
    echo json_encode(['error' => 'Only GIF, JPEG, PNG, and WEBP images are allowed.']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

$filename = bin2hex(random_bytes(12)) . '.' . $allowedTypes[$mimeType];
$target = $uploadDir . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not save uploaded image.']);
    exit;
}

echo json_encode(['url' => 'uploads/' . $filename]);
