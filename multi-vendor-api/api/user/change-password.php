<?php
include_once '../../config/Database.php';
include_once '../../models/User.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new User($db);
$result = 0;
if (!empty($data->Password) && !empty($data->UserToken))
    $result = $service->UpdatePassword($data->UserToken, $data->Password);
echo json_encode($result);
