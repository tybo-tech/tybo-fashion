<?php
include_once '../../config/Database.php';
include_once '../../models/Images.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new Images($db);
if (!empty($data->CreateDate))
    $result = $service->Update($data);
else $result = $service->Create($data);
echo json_encode($result);
