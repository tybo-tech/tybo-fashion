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
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 40; // Default to 40 if not provided
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0; // Default to 0 if not provided
$database = new Database();
$db = $database->connect();

$service = new ProductQuery($db);

$result = $service->getByCompany($CompanyId, $limit, $isAdmin, $offset);

// echo json_encode($result);
echo json_encode(cleanUtf8Array($result));
