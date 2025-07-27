<?php
include_once '../../config/Database.php';
include_once '../../models/ProductQuery.php';
include_once '../../models/User.php';
$database = new Database();
$db = $database->connect();

$service = new ProductQuery($db);
$result = $service->getRecent($_GET['count'] ?? 3);
echo json_encode($result);
