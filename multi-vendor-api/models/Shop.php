<?php
require_once 'Categories.php';
require_once 'Company.php';
require_once 'ProductQuery.php';

class Shop
{
    private $conn;
    private ProductQuery $productQueryService;

    public function __construct($db)
    {
        $this->conn = $db;
        $this->productQueryService = new ProductQuery($db);
    }

    public function GetShop($data)
    {
        if (!$data) return [];

        $stmt = $this->conn->prepare("SELECT * FROM company WHERE CompanyId = ? OR Slug = ?");
        $stmt->execute([$data->ShopId, $data->ShopId]);

        if (!$stmt->rowCount()) return [];

        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        $item["Metadata"] = json_decode($item["Metadata"]);

        // ✅ Load category tree
        if ($data->IncludeCategories) {
            $categoryService = new Categories($this->conn);
            $item["Categories"] = $categoryService->getHierarchyWithCounts($item["CompanyId"],true, 4);
        }

        // ✅ Return pinned products
        $item["PinnedProducts"] = $this->productQueryService->getFeaturedProducts($item["CompanyId"]);

        // ✅ Return recent products (New In)
        $item["RecentProducts"] = $this->productQueryService->getRecentProducts($item["CompanyId"]);

        return $item;
    }



}
