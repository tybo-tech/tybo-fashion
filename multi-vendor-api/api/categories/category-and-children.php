<?php
header('Content-Type: application/json');
include_once '../../config/Database.php';
include_once '../../models/Categories.php';
include_once '../../models/Company.php';

if (!isset($_GET['companyId']) || !isset($_GET['categoryId'])) {
    echo json_encode(['error' => 'companyId and categoryId are required']);
    exit;
}

$companyId = $_GET['companyId'];
$categoryId = $_GET['categoryId'];
$isAdmin = $_GET['isAdmin'] ?? '';

$database = new Database();
$db = $database->connect();

$service = new Categories($db);
$companyService = new Company($db);
$company = $companyService->simple($companyId);
if(!$company) {
    echo json_encode(['error' => 'Company not found']);
    exit;
}
$result = $service->GetCategoryAndChildren($company['CompanyId'] , $categoryId, $isAdmin === 'yes');
$result['Company'] = $company;
echo json_encode($result);
