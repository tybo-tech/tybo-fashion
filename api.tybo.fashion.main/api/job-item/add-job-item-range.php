<?php
include_once '../../config/Database.php';
include_once '../../models/JobItem.php';

$data = json_decode(file_get_contents("php://input"));

$products = $data->jobItems;


//connect to db
$database = new Database();
$db = $database->connect();


foreach ($jobItems as $item) {
    $JobItem = new JobItem($db);

    $result = $JobItem->Create($item);
}
    echo json_encode(true);

 
 


