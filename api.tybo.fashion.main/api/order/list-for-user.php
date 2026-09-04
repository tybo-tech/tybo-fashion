<?php
include_once '../../config/Database.php';
include_once '../../models/Orders.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new Orders($db);
$result = $service->GetByUserId($_GET['UserId']);
echo json_encode($result);
