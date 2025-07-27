<?php
include_once '../../config/Database.php';
include_once '../../models/ProductMutation.php';

$productList = json_decode(file_get_contents("php://input"));
if ($productList && is_array($productList) && count($productList)) {
    $database = new Database();
    $db = $database->connect();
    $Id = $database->getGuid($db);
    $service = new ProductMutation($db);
    $results = [];
    $result = $service->UpdateRange($productList);
    echo json_encode($results);

} else {
    echo json_encode([]);
}

