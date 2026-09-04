<?php
include_once '../../config/Database.php';
include_once '../../models/ImageCleanUp.php';

$database = new Database();
$db = $database->connect();

$service = new ImageCleanUp($db);

$result = $service->go();

echo json_encode($result);
