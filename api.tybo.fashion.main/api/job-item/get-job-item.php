<?php
include_once '../../config/Database.php';
include_once '../../models/JobItem.php';

$data = json_decode(file_get_contents("php://input"));
$Id =$_GET['JobItemId'];

$database = new Database();
$db = $database->connect();

$JobItem = new JobItem($db);

$result = $JobItem->getById($Id, true);
  echo json_encode($result);

 
 


