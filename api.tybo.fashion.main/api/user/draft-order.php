<?php
include_once '../../config/Database.php';
include_once '../../models/User.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new User($db);
$result = $service->draft_order($_GET['Id']);
// echo json_encode($result);
 echo json_encode(cleanUtf8Array($result));
