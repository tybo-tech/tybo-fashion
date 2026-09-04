<?php
include_once '../../config/Database.php';
include_once '../../models/Customer.php';


$database = new Database();
$db = $database->connect();

$service = new Customer($db);
$result = $service->getCustomers($_GET['CompanyId'], $_GET['CustomerType']);
error_log(
    "CompanyId: " . $_GET['CompanyId'] . 
    ", CustomerType: " . $_GET['CustomerType'] . 
    ", Result Count: " . count($result) . 
    ", Result: " . json_encode($result, JSON_PRETTY_PRINT)
);
echo json_encode(cleanUtf8Array($result));