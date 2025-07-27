<?php
include_once '../../config/Database.php';
include_once '../../models/Shop.php';

$ProductId =  $_GET['ProductId'];
$database = new Database();
$db = $database->connect();

$service = new Shop($db);

$result = $service->GetFeatured();

echo json_encode($result);
