<?php
include_once '../../config/Database.php';
include_once '../../models/Other_info.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new Other_info($db);

$result = $service->delete($_GET['Id']);


echo json_encode($result);
