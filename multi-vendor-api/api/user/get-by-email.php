<?php
include_once '../../config/Database.php';
include_once '../../models/User.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new User($db);
$result = $service->getByEmail($_GET['Email']);
echo json_encode($result);
