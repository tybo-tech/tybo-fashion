<?php
include_once '../../config/Database.php';
include_once '../../models/Shop.php';

$data = json_decode(file_get_contents("php://input"));

// Validate required data
if (!$data || !isset($data->ShopId)) {
    echo json_encode(['error' => 'ShopId is required']);
    exit;
}

$database = new Database();
$db = $database->connect();

$service = new Shop($db);

try {
    $result = $service->GetShop($data);
    echo json_encode(cleanUtf8Array($result));
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to get shop data', 'message' => $e->getMessage()]);
}
