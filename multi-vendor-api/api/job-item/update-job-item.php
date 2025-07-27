<?php
include_once '../../config/Database.php';
include_once '../../models/JobItem.php';



$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();
$jobItem = new JobItem($db);

$result = $jobItem->Update($data);

    
    echo json_encode($result);

 
 


