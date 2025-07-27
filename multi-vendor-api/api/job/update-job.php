<?php
include_once '../../config/Database.php';
include_once '../../models/Job.php';

$data = json_decode(file_get_contents("php://input"));


$database = new Database();
$db = $database->connect();

$job = new Job($db);
$addedJob = $job->Update(
    $data
);

echo json_encode($addedJob);
