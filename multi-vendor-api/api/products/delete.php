<?php
include_once '../../config/Database.php';
include_once '../../models/ProductMutation.php';

$ProductId =  $_GET['ProductId'];
$database = new Database();
$db = $database->connect();

$service = new ProductMutation($db);

$result = $service->delete($ProductId);

echo json_encode($result);
