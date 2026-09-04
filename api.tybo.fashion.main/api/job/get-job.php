<?php
include_once '../../config/Database.php';
include_once '../../models/Job.php';

$data = json_decode(file_get_contents("php://input"));

$JobId = $_GET['JobId'];


$database = new Database();
$db = $database->connect();

$job = new Job($db);

$result = $job->GetJobById($JobId);

echo json_encode(cleanUtf8Array($result));
