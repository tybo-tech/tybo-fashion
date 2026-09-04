<?php
// api/product-variation/remove.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/Database.php';
require_once '../../models/ProductVariationManager.php';

// Parse incoming JSON
$data = json_decode(file_get_contents("php://input"));
if (!$data || !isset($data->productId, $data->variationId)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields: productId and variationId"]);
    exit;
}

$productId = $data->productId;
$variationId = $data->variationId;

try {
    $database = new Database();
    $db = $database->connect();

    $manager = new ProductVariationManager($db);
    $result = $manager->removeProductVariation($productId, $variationId);

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $result]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error", "details" => $e->getMessage()]);
}
