<?php
include_once '../../config/Database.php';
include_once '../../models/Variations.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new Variations($db);
$result = $service->getById($_GET['id']);
echo json_encode($result);
