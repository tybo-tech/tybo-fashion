<?php
include_once '../../config/Database.php';
include_once '../../models/ProductQuery.php';
$CompanyId = '';
if (isset($_GET['CompanyId']) && $_GET['CompanyId'] != '') {
    $CompanyId = $_GET['CompanyId'];
} else {
    echo json_encode(['error' => 'companyId is required']);
    exit;
}

$isAdmin = isset($_GET['isAdmin']) ? $_GET['isAdmin'] : false;
$database = new Database();
$db = $database->connect();

$service = new ProductQuery($db);

$result = $service->getByCompany($CompanyId, 10000, $isAdmin);

// echo json_encode($result);
echo json_encode(cleanUtf8Array($result));
