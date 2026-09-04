<?php
include_once '../../config/Database.php';
include_once '../../models/Categories.php';

if (!isset($_GET['parentId']) || !isset($_GET['companyId'])) {
    echo json_encode(['error' => 'parentId and companyId are required']);
    exit;
}

$database = new Database();
$db = $database->connect();

$service = new Categories($db);
$result = $service->GetCategoriesByParent($_GET['companyId'], $_GET['parentId']);
echo json_encode($result);
