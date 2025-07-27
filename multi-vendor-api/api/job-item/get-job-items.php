<?php
include_once '../../config/Database.php';
include_once '../../models/JobItem.php';

$data = json_decode(file_get_contents("php://input"));
$JobId =$_GET['JobId'];

$database = new Database();
$db = $database->connect();

$JobItem = new JobItem($db);

$result = $JobItem->getByJobId(
    $JobId
);
  echo json_encode($result);

 
 


