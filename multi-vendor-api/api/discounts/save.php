<?php
include_once '../../config/Database.php';
include_once '../../models/Discounts.php';

$data = json_decode(file_get_contents("php://input"));
if($data == null) {
    echo json_encode(array("ERROR" => "No data provided"));
    exit;
}
$database = new Database();
$db = $database->connect();

$service = new Discounts($db);
if (!empty($data->Createdate))
    $result = $service->Update($data);
else $result = $service->Create($data);

echo json_encode($result);
