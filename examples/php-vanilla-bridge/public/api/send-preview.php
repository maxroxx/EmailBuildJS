<?php
declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$payload = json_decode((string) file_get_contents('php://input'), true);
$to = is_array($payload) ? (string) ($payload['to'] ?? '') : '';
$html = is_array($payload) ? (string) ($payload['html'] ?? '') : '';

if (!filter_var($to, FILTER_VALIDATE_EMAIL) || $html === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Expected a valid email address and rendered HTML.']);
    exit;
}

$previewDir = __DIR__ . '/../data/previews';
if (!is_dir($previewDir)) {
    mkdir($previewDir, 0775, true);
}

$record = [
    'to' => $to,
    'html' => $html,
    'created_at' => gmdate(DATE_ATOM),
];

file_put_contents($previewDir . DIRECTORY_SEPARATOR . gmdate('Ymd-His') . '.json', json_encode($record, JSON_PRETTY_PRINT));

echo json_encode([
    'ok' => true,
    'message' => 'Preview payload saved. Replace this endpoint with your mailer or email API.',
]);
