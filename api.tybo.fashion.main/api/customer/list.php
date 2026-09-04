<?php
include_once '../../config/Database.php';
include_once '../../models/Customer.php';


$database = new Database();
$db = $database->connect();

$service = new Customer($db);
$result = $service->getCustomers($_GET['CompanyId'], $_GET['CustomerType']);
echo json_encode(cleanUtf8Array($result));