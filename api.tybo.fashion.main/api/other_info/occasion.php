<?php
/**
 * Cross-designer gallery pieces for one occasion.
 *
 * GET /other_info/occasion.php?slug=matric-dance&limit=60
 *
 * Returns { Occasion, Items[] } where each item includes its designer. Returns
 * a 404-style error object for an unknown occasion slug.
 */
include_once '../../config/Database.php';
include_once '../../models/Other_info.php';

$slug = trim((string) ($_GET['slug'] ?? ''));
$limit = (int) ($_GET['limit'] ?? 60);
if ($limit <= 0) {
    $limit = 60;
}

if ($slug === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameter: slug']);
    exit;
}

$database = new Database();
$db = $database->connect();

$service = new Other_info($db);
$result = $service->occasionGallery($slug, $limit);

if ($result === null) {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown occasion', 'slug' => $slug]);
    exit;
}

echo json_encode(cleanUtf8Array($result));
