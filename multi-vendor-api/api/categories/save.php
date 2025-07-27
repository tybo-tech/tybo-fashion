<?php
include_once '../../config/Database.php';
include_once '../../models/Categories.php';

$data = json_decode(file_get_contents("php://input"));
if($data == null) {
    echo json_encode(array("ERROR" => "No data provided"));
    exit;
}
$database = new Database();
$db = $database->connect();

$service = new Categories($db);
if (!empty($data->CreateDate))
    $result = $service->Update($data);
else $result = $service->Create($data);

echo json_encode($result);
