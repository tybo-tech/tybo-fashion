<?php
include_once '../../config/Database.php';
include_once '../../models/JobItem.php';

$data = json_decode(file_get_contents("php://input"));

// create user data only
$OrderId =$_GET['CompanyId'];


//connect to db
$database = new Database();
$db = $database->connect();

// create user first to get UserId
$JobItem = new JobItem($db);

$result = $JobItem->getByCompanyId(
    $OrderId
);
 
    echo json_encode($result);

 
 


