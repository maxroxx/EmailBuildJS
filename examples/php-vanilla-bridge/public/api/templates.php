<?php
declare(strict_types=1);

header('Content-Type: application/json');

$templateDir = realpath(__DIR__ . '/../data/templates') ?: __DIR__ . '/../data/templates';
if (!is_dir($templateDir)) {
    mkdir($templateDir, 0775, true);
}

function template_path(string $templateDir, string $id): string
{
    $safeId = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
    if ($safeId === '') {
        throw new RuntimeException('Invalid template id.');
    }
    return $templateDir . DIRECTORY_SEPARATOR . $safeId . '.json';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $templates = [];
    foreach (glob($templateDir . DIRECTORY_SEPARATOR . '*.json') ?: [] as $file) {
        $json = json_decode((string) file_get_contents($file), true);
        if (is_array($json)) {
            $templates[] = $json;
        }
    }
    echo json_encode($templates, JSON_PRETTY_PRINT);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($payload) || !isset($payload['id'], $payload['document'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Expected id and document.']);
        exit;
    }

    $record = [
        'id' => (string) $payload['id'],
        'title' => (string) ($payload['title'] ?? $payload['id']),
        'document' => $payload['document'],
        'html' => (string) ($payload['html'] ?? ''),
        'updated_at' => gmdate(DATE_ATOM),
    ];

    file_put_contents(template_path($templateDir, $record['id']), json_encode($record, JSON_PRETTY_PRINT));
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
