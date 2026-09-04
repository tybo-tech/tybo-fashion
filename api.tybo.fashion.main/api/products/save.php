<?php
include_once '../../config/Database.php';
include_once '../../models/ProductMutation.php';
include_once '../../models/ProductVariationManager.php';
include_once '../../models/ProductCategory.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();
$Id = $database->getGuid($db);

$service = new ProductMutation($db);
$productVariationManager = new ProductVariationManager($db);
$productCategoryManager = new ProductCategory($db);

// Create or Update
$result = !empty($data->CreateDate) ?
    $service->Update($data) : $service->Create($data);

// Only proceed if the product was successfully created or updated
if (isset($result['Id'])) {
    $productId = $result['Id'];
    $userId = $result['CreateUserId'] ?? $result['CompanyId'] ?? 'not-set';

    // Save product variations
    if (!empty($data->ProductVariationPayload) && is_array($data->ProductVariationPayload)) {
        $result['IsVariationPayloadSaved'] = $productVariationManager->saveProductVariationPayload(
            $productId,
            $data->ProductVariationPayload,
            $userId
        );
    }

    // Save product categories
    if (!empty($data->Categories) && is_array($data->Categories)) {
        $categoryIds = array_map(fn($cat) => $cat->CategoryId, $data->Categories);
        $result['IsCategoryPayloadSaved'] = $productCategoryManager->syncCategories(
            $productId,
            $categoryIds
        );
    }
}

echo json_encode($result);
