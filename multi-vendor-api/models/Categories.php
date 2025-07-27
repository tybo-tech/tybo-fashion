<?php
require_once 'Discounts.php';
class Categories
{
    private $conn;
    private Discounts $discountService;
    private $isAdmin;
    public function __construct($db)
    {
        $this->conn = $db;
        $this->discountService = new Discounts($db);
        $this->isAdmin = false;
    }

    public function Create($data)
    {
        $check = $this->GetByNameAndParentId($data->ParentId, $data->Name);
        if (isset($check)) {
            return $check;
        }

        $query = "INSERT INTO category (
            CategoryId,
            CompanyId,
            ParentCompanyId,
            Name,
            ImageUrl,
            PhoneBanner,
            ParentId,
            CategoryType,
            CompanyType,
            Description,
            DisplayOrder,
            IsDeleted,
            CreateUserId,
            ModifyUserId,
            StatusId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute([
                    $data->CategoryId,
                    $data->CompanyId,
                    $data->ParentCompanyId ?? null,
                    $data->Name,
                    $data->ImageUrl,
                    $data->PhoneBanner,
                    $data->ParentId,
                    $data->CategoryType,
                    $data->CompanyType,
                    $data->Description,
                    $data->DisplayOrder,
                    $data->IsDeleted ?? 0,
                    $data->CreateUserId,
                    $data->ModifyUserId,
                    $data->StatusId
                ])
            ) {
                return $this->GetById($data->CategoryId);
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function Update($data)
    {
        $query = "UPDATE category SET
            Name = ?,
            ImageUrl = ?,
            PhoneBanner = ?,
            ParentId = ?,
            CategoryType = ?,
            CompanyType = ?,
            Description = ?,
            DisplayOrder = ?,
            IsDeleted = ?,
            ModifyDate = NOW(),
            ModifyUserId = ?,
            StatusId = ?
        WHERE CategoryId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute([
                    $data->Name,
                    $data->ImageUrl,
                    $data->PhoneBanner,
                    $data->ParentId,
                    $data->CategoryType,
                    $data->CompanyType,
                    $data->Description,
                    $data->DisplayOrder,
                    $data->IsDeleted ?? 0,
                    $data->ModifyUserId,
                    $data->StatusId,
                    $data->CategoryId
                ])
            ) {
                return $this->GetById($data->CategoryId);
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function GetById($CategoryId)
    {
        $query = "SELECT * FROM category WHERE CategoryId = ? and IsDeleted = 0";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$CategoryId]);
            if ($stmt->rowCount()) {
                $category = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($category) {
                    $category['Discount'] = $this->discountService->getByCollectionId($CategoryId);
                }
                return $category;
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    private function hasImages($query)
    {
        if ($this->isAdmin) {
            return $query .= " AND IsDeleted = 0";
        }
        $query .= " AND ImageUrl <> '' AND ImageUrl <> 'null' AND ImageUrl IS NOT NULL AND IsDeleted = 0";
        return $query;
    }
    public function GetByCompanyId($CompanyId)
    {
        $query = "SELECT * FROM category WHERE CompanyId = ?";
        $query = $this->hasImages($query);
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$CompanyId]);
            if ($stmt->rowCount()) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            return [];
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }
    public function GetByNameAndParentId($ParentId, $Name)
    {
        $query = "SELECT * FROM category WHERE ParentId = ? AND Name = ?";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$ParentId, $Name]);
            if ($stmt->rowCount()) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function GetByProductId($ProductId)
    {
        $query = "SELECT * FROM category WHERE ParentId = ?";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$ProductId]);
            if ($stmt->rowCount()) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            return [];
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }
    function listNamesAndIds($companyId)
    {
        $query = "SELECT CategoryId, Name FROM category WHERE CompanyId = ? AND IsDeleted = 0";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$companyId]);
            if ($stmt->rowCount()) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            return [];
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }
    public function Delete($Id)
    {
        $query = "UPDATE category SET IsDeleted = 1, ModifyDate = NOW() WHERE CategoryId = ?";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$Id]);
            return $stmt->rowCount() ? ["success" => true] : ["error" => "No rows affected"];
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }
    public function getHierarchyWithCounts(
        $companyId,
        $onlyPinned = false,
        $childLimit = 4,
        $isAdmin = false
    ) {
        // Step 1: Get all categories
        $this->isAdmin = $isAdmin;
        $allCategories = $this->GetByCompanyId($companyId);
        $counts = $this->getProductCountsByCategory($companyId);

        $discounts = $this->discountService->getActiveDiscounts($companyId);

        // Step 2: Create a byId map
        $byId = [];
        foreach ($allCategories as &$cat) {
            $cat['Children'] = [];
            $cat['Discount'] = $this->discountService->findByCollectionId($cat['CategoryId'], $discounts);
            $cat['CountProducts'] = $counts[$cat['CategoryId']] ?? 0;
            $byId[$cat['CategoryId']] = &$cat;
        }

        // Step 3: Assign children (use full list for parent-child relations)
        foreach ($byId as &$cat) {
            if ($cat['ParentId'] && isset($byId[$cat['ParentId']])) {
                $byId[$cat['ParentId']]['Children'][] = &$cat;
            }
        }

        // Step 4: Get pinned roots (or all roots if not filtering)
        $roots = array_filter(
            $byId,
            fn($cat) =>
            (!$cat['ParentId']) &&
            (!$onlyPinned || $cat['IsPinned'])
        );

        // Step 5: Limit children count if needed
        foreach ($roots as &$root) {
            if (count($root['Children']) > $childLimit) {
                $root['Children'] = array_slice($root['Children'], 0, $childLimit);
            }
        }

        return array_values($roots);
    }
    public function GetCategoryAndChildren($companyId, $categoryId, $isAdmin = false)
    {
        $this->isAdmin = $isAdmin;
        $query = "SELECT * FROM category 
              WHERE CompanyId = ? 
                AND CategoryId = ?";
        // $query = $this->hasImages($query);

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$companyId, $categoryId]);
        $category = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$category) {
            return null;
        }
        $category['Children'] = $this->GetCategoriesByParent($companyId, $categoryId);
        return $category;
    }
    public function GetCategoriesByParent($companyId, $parentId)
    {
        $query = "
            SELECT 
                c.*, 
                COUNT(cp.ProductId) AS CountProducts
            FROM category c
            LEFT JOIN category_product cp ON cp.CategoryId = c.CategoryId
            LEFT JOIN product p ON p.Id = cp.ProductId AND p.ShowOnline = 1
            WHERE c.CompanyId = ?
              AND c.ParentId = ?
              AND c.IsDeleted = 0
            GROUP BY c.CategoryId
            ORDER BY c.DisplayOrder ASC, c.CreateDate DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$companyId, $parentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC)  ?? [];
    }



    public function getProductCountsByCategory($companyId)
    {
        $query = "SELECT cp.CategoryId, COUNT(*) AS CountProducts
              FROM category_product cp
              JOIN product p ON cp.ProductId = p.Id
              WHERE p.CompanyId = ? AND p.ShowOnline = 1
              GROUP BY cp.CategoryId";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$companyId]);

        $counts = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $counts[$row['CategoryId']] = (int) $row['CountProducts'];
        }
        return $counts;
    }

}
