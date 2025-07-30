<?php
require_once 'Company.php';
require_once 'Categories.php';
require_once 'Images.php';
require_once 'ProductCategory.php';
require_once 'ProductVariationManager.php';
require_once 'DiscountManager.php';
require_once 'Discounts.php';

class ProductQuery
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getById($ProductId,$IsAdmin = false)
    {
        $productCategory = new ProductCategory($this->conn);
        $productVariationManager = new ProductVariationManager($this->conn);
        $company = new Company($this->conn);


        $stmt = $this->conn->prepare("SELECT * FROM product WHERE ProductId = ? OR Slug = ?");
        $stmt->execute([$ProductId, $ProductId]);

        if ($stmt->rowCount()) {
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($item) {
                $item['Categories'] = $productCategory->getCategoryDetailsByProductId($item['Id']);
                $item['Variations'] = $productVariationManager->getProductVariations($item['Id']);
                $item['Images'] = json_decode($item['Images'], true);
                $item['Metadata'] = json_decode($item['Metadata'], true);

                if(!$IsAdmin){
                    // No need to show the company details to the admin since they alreay logged in and have access to the company
                     $item['Company'] = $company->simple($item['CompanyId']);

                     // No need to  so related products to the admin since they are just editing the product
                     $item['RelatedProducts'] = $this->getRelatedProducts($item['Id'], 30);
                }

                $discountService = new Discounts($this->conn);
                $discount = $discountService->getActiveDiscountForProduct($item['Id']);

                if ($discount && $discount['Id']) {
                    return (new DiscountManager())->applyDiscountToProduct($item, $discount);
                }
                $discountService = new DiscountManager();
                return $discountService->applyDiscountToProduct($item);
            }
        }
        return [];
    }

    public function getRecent($limit = 3, $companyId = '')
    {
        $query = "SELECT Slug, ProductId, CompanyId, Name, RegularPrice, Description, FeaturedImageUrl
                  FROM product
                  WHERE FeaturedImageUrl <> '' AND ShowOnline = '1'";

        if (!empty($companyId)) {
            $query .= " AND CompanyId = ?";
            $params = [$companyId];
        } else {
            $params = [];
        }

        $query .= " ORDER BY CreateDate DESC LIMIT $limit";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return (new DiscountManager())->applyDiscountsToProducts($items);
    }

    public function getFeatured()
    {
        $stmt = $this->conn->prepare("SELECT Slug, ProductId, CompanyId, Name, RegularPrice, Description, FeaturedImageUrl
                                      FROM product WHERE IsFeatured = 'Yes'
                                      ORDER BY CreateDate DESC LIMIT 3");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?? [];
    }

    public function getByCompany($companyId, $limit = 40)
    {
        $companyService = new Company($this->conn);
        $company = $companyService->simple($companyId);
        if(!$company) {
            throw new InvalidArgumentException("Company not found");
        }
        $companyId = $company['CompanyId']; // Ensure we use the correct company ID
        $limit = (int) $limit; // ensure it's a safe integer
        $query = "SELECT Id, Slug, Name, FeaturedImageUrl, RegularPrice, CompanyId, IsFeatured, ProductId
              FROM product
              WHERE CompanyId = ? AND FeaturedImageUrl <> '' AND ShowOnline = 1
              ORDER BY CreateDate DESC LIMIT $limit";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$companyId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return (new DiscountManager())->applyDiscountsToProducts($items);
    }

    public function getAll($limit = 40)
    {
        $stmt = $this->conn->prepare("SELECT Id, Slug, Name, FeaturedImageUrl, RegularPrice, CompanyId
                                      FROM product
                                      WHERE FeaturedImageUrl <> ''
                                      ORDER BY CreateDate DESC LIMIT ?");
        $stmt->execute([$limit]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return (new DiscountManager())->applyDiscountsToProducts($items);
    }

    public function getByProperty($companyId, $prop, $value)
    {
        $allowedProps = ['Sizes', 'Colors', 'Metadata', 'Measurements'];
        if (!in_array($prop, $allowedProps)) {
            throw new InvalidArgumentException("Invalid property name");
        }

        $query = "SELECT Id, Name, $prop FROM product WHERE CompanyId = ? AND $prop <> ''";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$companyId]);

        $results = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $item) {
            $decoded = json_decode($item[$prop], true);
            if (is_array($decoded) && in_array($value, $decoded)) {
                $results[] = $item;
            }
        }

        return $results;
    }

  public function getRelatedProducts(string $productId, int $limit = 6): array
{
    // Step 1: Get all category IDs linked to this product
    $queryCategories = "SELECT CategoryId FROM category_product WHERE ProductId = ?";
    $stmt = $this->conn->prepare($queryCategories);
    $stmt->execute([$productId]);
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($categories)) {
        return [];
    }

    // Step 2: Find other products in these categories, excluding the original product
    $placeholders = implode(',', array_fill(0, count($categories), '?'));

    $queryRelated = "
        SELECT DISTINCT p.*
        FROM category_product cp
        INNER JOIN product p ON p.Id = cp.ProductId
        WHERE cp.CategoryId IN ($placeholders)
          AND p.ProductId <> ?
          AND p.ShowOnline = 1
          AND p.FeaturedImageUrl <> ''
        ORDER BY p.CreateDate DESC
        LIMIT $limit
    ";

    $params = array_merge($categories, [$productId]);
    $stmt = $this->conn->prepare($queryRelated);
    $stmt->execute($params);

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $this->applyDiscountsToProducts($products);
}


    public function getByIds(array $productIds)
    {
        if (empty($productIds))
            return [];
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $stmt = $this->conn->prepare("SELECT Name, RegularPrice, FeaturedImageUrl, IsJustInTime, StatusId, StockType, Slug, ProductId, CompanyId FROM product WHERE ProductId IN ($placeholders)");
        $stmt->execute($productIds);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function list($filter)
    {
        $companyId = $filter->CompanyId ?? null;
        $limit = (int) ($filter->Limit ?? 40); // Cast to integer to prevent SQL injection

        $query = "SELECT Id,
                    ProductId,
                    Slug,
                    Name,
                    FeaturedImageUrl,
                    RegularPrice,
                    IsJustInTime,
                    IsFeatured,
                    ShowOnline,
                    CompanyId
                  FROM product
                  WHERE FeaturedImageUrl <> ''";

        $params = [];

        if ($companyId) {
            $query .= " AND CompanyId = ?";
            $params[] = $companyId;
        }

        $query .= " ORDER BY CreateDate DESC LIMIT $limit"; // Inject limit safely

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return (new DiscountManager())->applyDiscountsToProducts($items);
    }

    /**
     * Get a category with its active, visible products.
     *
     * @param string $categoryId
     * @param int $limit
     * @return array
     */
    public function getProductsByCategory(string $categoryId, int $limit = 100): array
    {
        $category = $this->getCategoryWithCompany($categoryId);
        if (isset($category['error'])) {
            return $category;
        }

        $products = $this->getVisibleProductsForCategory($categoryId, $limit);
        $category['Products'] = (new DiscountManager())
            ->applyDiscountsToProducts($products, $category['Discount'] ?? null);

        return $category;
    }

    /**
     * Retrieve a category and attach its company metadata.
     *
     * @param string $categoryId
     * @return array Category with 'Company' field or error
     */
    private function getCategoryWithCompany(string $categoryId): array
    {
        $categoryService = new Categories($this->conn);
        $category = $categoryService->GetById($categoryId);
        if (!$category) {
            return ['error' => 'Category not found'];
        }

        $companyService = new Company($this->conn);
        $company = $companyService->simple($category['CompanyId']);
        if (!$company) {
            return ['error' => 'Company not found'];
        }

        $category['Company'] = $company;
        return $category;
    }

    /**
     * Fetch visible, active products for a category.
     *
     * @param string $categoryId
     * @param int $limit
     * @return array List of products
     */
    private function getVisibleProductsForCategory(string $categoryId, int $limit): array
    {
        $query = "
        SELECT p.*
        FROM category_product cp
        INNER JOIN product p ON cp.ProductId = p.Id
        WHERE cp.CategoryId = :categoryId
          AND p.StatusId = 1
          AND p.ShowOnline = 1
        ORDER BY p.CreateDate DESC
        LIMIT :limit
    ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':categoryId', $categoryId);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFeaturedProducts($companyId)
    {
        $query = "
        SELECT * FROM product
        WHERE CompanyId = ?
          AND ShowOnline = 1
          AND IsFeatured = 'Yes'
          AND FeaturedImageUrl <> ''
        ORDER BY CreateDate DESC
    ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$companyId]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $this->applyDiscountsToProducts($products);
    }


    function getRecentProducts($CompanyId)
    {
        $query = "
            SELECT * FROM product
            WHERE CompanyId = ?
              AND ShowOnline = 1
              AND FeaturedImageUrl <> ''
            ORDER BY CreateDate DESC
            LIMIT 4";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$CompanyId]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $this->applyDiscountsToProducts($products);
    }


    private function applyDiscountsToProducts($products)
    {
        if (!$products || count($products) === 0) {
            return [];
        }

        // Initialize once
        $discountService = new Discounts($this->conn);
        $discountManager = new DiscountManager();

        foreach ($products as &$product) {
            $discount = $discountService->getActiveDiscountForProduct($product['Id']);
            if ($discount && $discount['Id']) {
                $product = $discountManager->applyDiscountToProduct($product, $discount);
                $product['Discount'] = $discount;
            }
        }

        return $products;
    }
}
?>
