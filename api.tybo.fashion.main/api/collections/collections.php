<?php
include_once '../../config/Database.php';
include_once '../../models/CollectionListQuery.php';
$CompanyId = '';
$Type = '';

if (isset($_GET['CompanyId']) && $_GET['CompanyId'] != '' && $_GET['CompanyId'] != 'tybo-fashion') {
    $CompanyId = $_GET['CompanyId'];
}

if (isset($_GET['Type']) && $_GET['Type'] != '') {
    $Type = $_GET['Type'];
}
$database = new Database();
$db = $database->connect();

$service = new CollectionListQuery($db);

$result = !empty($CompanyId) ?
    $service->collections($CompanyId, $Type) :
    $service->allCollections($Type);

echo json_encode($result);
