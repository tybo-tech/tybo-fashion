<?php
include_once '../../config/Database.php';
include_once '../../models/User.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();
$user_type = $_GET['UserType'] ?? '';
$company_id = $_GET['CompanyId'] ?? '';
$service = new User($db);
$result = $service->getUsers($company_id,$user_type);
echo json_encode($result);
