<?php
include_once '../../config/Database.php';
include_once '../../models/User.php';
include_once '../../models/Orders.php';
include_once '../../models/Orderproduct.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new User($db);
$result = $service->getUserByEmailandPassword($data->Email, $data->Password);

echo json_encode($result);
