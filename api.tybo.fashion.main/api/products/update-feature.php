<?php
include_once '../../config/Database.php';
include_once '../../models/ProductMutation.php';

$data = json_decode(file_get_contents("php://input"));
$isFeatured = isset($data->IsFeatured) ? $data->IsFeatured : null;
$productId = isset($data->Id) ? $data->Id : null;
if ($isFeatured === null || $productId === null) {
    echo json_encode(['error' => 'IsFeatured and Id (Product Id) are required']);
    exit;
}
$database = new Database();
$db = $database->connect();
$Id = $database->getGuid($db);

$service = new ProductMutation($db);
$result = $service->feature($productId, $isFeatured);

echo json_encode($result);
