<?php
include_once '../../config/Database.php';
include_once '../../models/ProductListQuery.php';
$companyId = '';
$prop = '';
$value = '';

if (isset($_GET['companyId']) && $_GET['companyId'] != '') {
    $companyId = $_GET['companyId'];
    $prop = $_GET['prop'];
    $value = $_GET['value'];
} else {
    $error = new stdClass();
    $error->message = "CompanyId is required";
    $error->isSuccess = false;
    echo json_encode($error);
    die();
}
$database = new Database();
$db = $database->connect();

$service = new ProductListQuery($db);

$result = $service->listProductsByProp(
    $companyId,
    $prop,
    $value
);
echo json_encode($result);
