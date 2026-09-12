<?php
/**
 * Cross-designer occasion index.
 *
 * GET /other_info/occasions.php
 *
 * Returns only occasions that have live WorkGallery pieces, each with a cover
 * image and count — the "shop by occasion" tiles for the homepage and index.
 */
include_once '../../config/Database.php';
include_once '../../models/Other_info.php';

$database = new Database();
$db = $database->connect();

$service = new Other_info($db);
$result = $service->occasionIndex();
echo json_encode(cleanUtf8Array($result));
