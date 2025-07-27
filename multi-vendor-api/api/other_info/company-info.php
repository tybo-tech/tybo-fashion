<?php
// api/other_info/company-info.php

/**
 * This endpoint returns a company's basic profile (`simple`) along with
 * flexible extra metadata stored in the `other_info` table.
 *
 * It supports two modes:
 *
 * 1. Fetch a specific info record by ID (`ItemId`)
 *    → Response includes: Company + `Info` (single object)
 *
 * 2. Fetch a list of info records by `CompanyId` and `ItemType`
 *    → Response includes: Company + `InfoList` (array of objects)
 *
 * Example use cases:
 * - Gallery items (type = "WorkGallery")
 * - Company stats, banners, or testimonials
 * - Custom data panels (not tied to products, orders, etc.)
 *
 * Required GET Params:
 * - `CompanyId` (string) → the company identifier
 * - `ItemType`  (string) → the type of info item to return
 *
 * Optional GET Param:
 * - `ItemId` (string) → to fetch a single item by ID
 */

include_once '../../config/Database.php';
include_once '../../models/Other_info.php';
require_once '../../models/Company.php';

// Inputs
$companyId = isset($_GET['CompanyId']) ? $_GET['CompanyId'] : '';
$itemType = isset($_GET['ItemType']) ? $_GET['ItemType'] : '';
$itemId = isset($_GET['ItemId']) ? $_GET['ItemId'] : '';

// Validate inputs
if (empty($companyId)) {
    echo json_encode(['error' => 'CompanyId is required']);
    exit;
}
if (empty($itemType)) {
    echo json_encode(['error' => 'ItemType is required']);
    exit;
}

// Setup
$database = new Database();
$db = $database->connect();

$service = new Other_info($db);
$companyService = new Company($db);
$company = $companyService->simple($companyId);

if (!$company) {
    echo json_encode(['error' => 'Company not found']);
    exit;
}

// Single record mode
if (!empty($itemId)) {
    $info = $service->getById($itemId);
    if (!$info) {
        $company['Info'] = null;
        echo json_encode($company);
        exit;
    }
    $company['Info'] = $info;
    echo json_encode($company);
    exit;
}

// Multiple record mode
$infoList = $service->search($companyId, $itemType);
if (!$infoList) {
    $company['InfoList'] = [];
    echo json_encode($company);
    exit;
}

$company['InfoList'] = $infoList;
echo json_encode($company);
