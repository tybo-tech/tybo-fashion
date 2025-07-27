<?php
// api/product/get.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/Database.php';
require_once '../../models/ProductQuery.php';

$ProductId = isset($_GET['ProductId']) ? $_GET['ProductId'] : null;
$IsAdmin = isset($_GET['IsAdmin']) ? $_GET['IsAdmin'] : null;
$IsAdmin = $IsAdmin === 'yes' ? true : false;  

if (!$ProductId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required parameter: ProductId"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();

    $service = new ProductQuery($db);
    $result = $service->getById($ProductId,$IsAdmin );

    // echo json_encode($result);
    echo json_encode(cleanUtf8Array($result));
} catch (Exception $e) {
    //http_response_code(500);
    echo json_encode(["error" => "Server error", "details" => $e->getMessage()]);
}
