<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/Database.php';
require_once '../../models/ProductQuery.php';

$data = json_decode(file_get_contents("php://input"));
if (!$data || !isset($data->CompanyId)) {
    echo json_encode(["error" => "Missing required field: CompanyId"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();

    $service = new ProductQuery($db);
    $result = $service->list($data);

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(["error" => "Server error", "details" => $e->getMessage()]);
}
