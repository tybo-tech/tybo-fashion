<?php
include_once '../../config/Database.php';
include_once '../../models/Variations.php';

if (!isset($_GET['companyId'])) {
    echo json_encode(['error' => 'companyId is required']);
    exit;
}
$database = new Database();
$db = $database->connect();

$service = new Variations($db);
$result = $service->ListByCompanyId($_GET['companyId']);
echo json_encode($result);
