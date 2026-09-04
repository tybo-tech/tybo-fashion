<?php
include_once '../../config/Database.php';
include_once '../../models/CompanyCategory.php';

if (!isset($_GET['companyId'])) {
    echo json_encode(['error' => 'companyId is required']);
    exit;
}
$parentId = isset($_GET['parentId']) ? $_GET['parentId'] : null;
$isAdmin = isset($_GET['isAdmin']) ? $_GET['isAdmin'] : null;
$companyId = $_GET['companyId'];
$database = new Database();
$db = $database->connect();

$service = new CompanyCategory($db);
$result = $service->getCategoriesByCompanyAndParent(
    $companyId,
    $isAdmin,
    $parentId
);
 echo json_encode(cleanUtf8Array($result));