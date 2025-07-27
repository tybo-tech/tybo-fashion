<?php
include_once '../../config/Database.php';
include_once '../../models/CollectionQuery.php';
$CompanyId = '';
$Type = '';
if(isset($_GET['CompanyId']) && $_GET['CompanyId'] != ''){
    $CompanyId = $_GET['CompanyId'];
}
if(isset($_GET['Type']) && $_GET['Type'] != ''){
    $Type = $_GET['Type'];
}
$Id = $_GET['Id'];
$database = new Database();
$db = $database->connect();

$service = new CollectionQuery($db);

$result = $service->collection($Id ,$CompanyId, $Type);

echo json_encode($result);
