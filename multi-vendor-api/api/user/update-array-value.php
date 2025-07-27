<?php
include_once '../../config/Database.php';
include_once '../../models/User.php';
$prop = '';
$oldValue = '';
$newValue = '';

if (isset($_GET['prop']) && $_GET['prop'] != '') {
    $prop = $_GET['prop'];
    $oldValue = $_GET['oldValue'];
    $newValue = $_GET['newValue'];
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

$result = $service->updateArrayValue(
    $prop,
    $oldValue,
    $newValue
);
echo json_encode($result);
