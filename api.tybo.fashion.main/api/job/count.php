<?php
include_once '../../config/Database.php';
include_once '../../models/Job.php';

$data = json_decode(file_get_contents("php://input"));

$CompanyId = $_GET['CompanyId'];


$database = new Database();
$db = $database->connect();

$job = new Job($db);

$result = $job->CountCompanyOrders($CompanyId);

echo json_encode($result);
