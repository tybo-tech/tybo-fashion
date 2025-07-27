<?php
include_once '../../config/Database.php';
include_once '../../models/Job.php';

$data = json_decode(file_get_contents("php://input"));

$CompanyId = $_GET['CompanyId'] ?? '';
$CreateUserId = $_GET['CreateUserId'] ?? '';


$database = new Database();
$db = $database->connect();

$job = new Job($db);
if (!empty($CreateUserId)) {
  $result = $job->GetJobsByCreateUserId($CreateUserId);
  echo json_encode(cleanUtf8Array($result));
  exit;
}

if (!empty($CompanyId)) {
  $result = $job->GetJobsByCompanyId($CompanyId, 1);
  echo json_encode(cleanUtf8Array($result));
  exit;
}


