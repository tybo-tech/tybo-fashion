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

        // Get admin flag from request data
        $isAdmin = isset($data->IsAdmin) ? $data->IsAdmin : false;

        // ✅ Load category tree with admin support
        if ($data->IncludeCategories) {
            $categoryService = new Categories($this->conn);
            // For admin: get all categories, for customers: only categories with 3+ products
            $minProductCount = $isAdmin ? 0 : 3;
            $item["Categories"] = $categoryService->getHierarchyWithCounts($item["CompanyId"], true, 4, $isAdmin);
        }

        // ✅ Return pinned products with admin support
        $item["PinnedProducts"] = $this->productQueryService->getFeaturedProducts($item["CompanyId"], $isAdmin);

        // ✅ Return recent products with admin support
        $item["RecentProducts"] = $this->productQueryService->getRecentProducts($item["CompanyId"], $isAdmin);

        return $item;
    }



}
