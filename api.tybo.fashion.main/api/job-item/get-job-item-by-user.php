<?php
include_once '../../config/Database.php';
include_once '../../models/JobItem.php';

$data = json_decode(file_get_contents("php://input"));
$Id =$_GET['Id'];

$database = new Database();
$db = $database->connect();

$JobItem = new JobItem($db);

$result = $JobItem->getByAssignedTo($Id);
  echo json_encode($result);

 
 


