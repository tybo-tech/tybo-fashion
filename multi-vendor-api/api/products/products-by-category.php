<?php
include_once '../../config/Database.php';
include_once '../../models/ProductQuery.php';

header('Content-Type: application/json');

// Validate query parameters
if (!isset($_GET['categoryId'])) {
    echo json_encode(['error' => 'Missing required parameter: categoryId']);
    exit;
}

$categoryId = $_GET['categoryId'];
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;

// Setup DB connection and service
$database = new Database();
$db = $database->connect();

$productQuery = new ProductQuery($db);

try {
    $products = $productQuery->getProductsByCategory($categoryId, $limit);
    // echo json_encode($products);
     echo json_encode(cleanUtf8Array($products));
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to fetch products', 'details' => $e->getMessage()]);
}
