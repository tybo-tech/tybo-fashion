<?php
include_once '../../config/Database.php';
include_once '../../models/Variations.php';

$data = json_decode(file_get_contents("php://input"));
if ($data == null) {
    echo json_encode(array("ERROR" => "No data provided"));
    exit;
}
$database = new Database();
$db = $database->connect();

$service = new Variations($db);
if (!empty($data->Createdate))
    $result = $service->UpdateOption($data);
else
    $result = $service->AddOption($data);

echo json_encode($result);
