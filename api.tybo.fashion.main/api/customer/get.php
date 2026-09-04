<?php
include_once '../../config/Database.php';
include_once '../../models/Customer.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new Customer($db);
$result = $service->getCustomerById($_GET['CustomerId']);
echo json_encode($result);
