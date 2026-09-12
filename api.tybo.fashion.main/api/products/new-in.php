<?php
include_once '../../config/Database.php';
include_once '../../models/ProductQuery.php';
include_once '../../models/User.php';
$database = new Database();
$db = $database->connect();

$service = new ProductQuery($db);
$count = (int) ($_GET['count'] ?? 3);
if ($count <= 0) {
  $count = 3;
}
$companyId = trim((string) ($_GET['companyId'] ?? ''));
$result = $service->getRecent($count, $companyId);
echo json_encode($result);
