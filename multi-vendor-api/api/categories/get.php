<?php
include_once '../../config/Database.php';
include_once '../../models/Categories.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new Categories($db);
$result = $service->getById($_GET['id']);
echo json_encode($result);
