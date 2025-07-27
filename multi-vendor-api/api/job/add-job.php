<?php
include_once '../../config/Database.php';
include_once '../../models/Job.php';

$data = json_decode(file_get_contents("php://input"));
if(!$data) {
    echo json_encode(array('message' => 'No data provided', 'success' => false));
    return;
}
$database = new Database();
$db = $database->connect();

$job = new Job($db);
$JobId = $database->getGuid($db);

$count = $job->CountCompanyOrders($data->CompanyId);
$data->JobNo = 'JOB' . ($count + 1);
if ($data->Metadata) {
    // Set Invoice No
    $data->Metadata->InvoiceNo = 'INV' . ($count + 1);
}


$addedJob = $job->Create(
    $JobId,
    $data
);

echo json_encode($addedJob);
