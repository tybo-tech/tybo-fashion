<?php
include_once '../../config/Database.php';
include_once '../../models/User.php';
$prop = '';
$value = '';

if (isset($_GET['prop']) && $_GET['prop'] != '') {
    $companyId = $_GET['companyId'];
    $prop = $_GET['prop'];
    $value = $_GET['value'];
} else {
    $error = new stdClass();
    $error->message = "Property is required";
    $error->isSuccess = false;
    echo json_encode($error);
    die();
}
$database = new Database();
$db = $database->connect();

$service = new User($db);

$result = $service->listUsersByProp(
    $prop,
    $value
);
echo json_encode($result);
