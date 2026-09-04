<?php
include_once '../../config/Database.php';
include_once '../../models/Other_info.php';

$join = '';
$id = '';
$key = '';
if (isset($_GET['Join']) && $_GET['Join'] != '') {
    $join = $_GET['Join'];
}
if (isset($_GET['Id']) && $_GET['Id'] != '') {
    $id = $_GET['Id'];
}
if (isset($_GET['Key']) && $_GET['Key'] != '') {
    $key = $_GET['Key'];
}
$database = new Database();
$db = $database->connect();

$service = new Other_info($db);

$result = $service->getById(
    $id,
    $join,
    $key
);


echo json_encode($result);
