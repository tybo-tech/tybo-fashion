<?php
include_once '../../config/Database.php';
include_once '../../models/Company.php';
$database = new Database();
$db = $database->connect();

$service = new Company($db);
$result = $service->getCounts($_GET['id']);
echo json_encode($result);
