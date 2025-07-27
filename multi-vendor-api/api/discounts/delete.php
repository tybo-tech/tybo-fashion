<?php
include_once '../../config/Database.php';
include_once '../../models/Discounts.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new Discounts($db);
$result = $service->delete($_GET['id']);
echo json_encode($result);
