<?php
include_once '../../config/Database.php';
include_once '../../models/Categories.php';

if (!isset($_GET['companyId'])) {
    echo json_encode(['error' => 'companyId is required']);
    exit;
}
$parentId = isset($_GET['parentId']) ? $_GET['parentId'] : null;
$companyId = $_GET['companyId'];
$database = new Database();
$db = $database->connect();

$service = new Categories($db);
$result = $service->listNamesAndIds(
    $companyId
);
echo json_encode($result);
