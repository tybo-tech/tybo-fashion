<?php
include_once '../../config/Database.php';
include_once '../../models/Other_info.php';

$database = new Database();
$db = $database->connect();

$service = new Other_info($db);


$result = $service->search(
    $_GET['ParentId'],
    $_GET['ItemType']
);


// echo json_encode($result);
 echo json_encode(cleanUtf8Array($result));
