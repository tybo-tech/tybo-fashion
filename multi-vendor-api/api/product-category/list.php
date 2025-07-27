<?php
include_once '../../config/Database.php';
include_once '../../models/ProductCategory.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new ProductCategory($db);
$result = $service->getProductsByCategoryId($_GET['categoryId']);
echo json_encode($result);
