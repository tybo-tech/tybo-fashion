<?php

class ProductCategory
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

   /**
 * Get all active category details linked to a product.
 */
public function getCategoryDetailsByProductId(int $productId): array
{
    // CategoryType = 'style' or 'collection' in this case
    $query = "
        SELECT c.*
        FROM category_product cp
        INNER JOIN category c ON cp.CategoryId = c.CategoryId
        WHERE cp.ProductId = :productId
          AND c.IsDeleted = 0
    ";

    $stmt = $this->conn->prepare($query);
    $stmt->execute([':productId' => $productId]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?? [];
}


    /**
     * Get all product IDs linked to a category.
     */
    public function getProductsByCategoryId($categoryId)
    {
        $query = "SELECT p.*
                  FROM category_product cp
                  JOIN product p ON cp.ProductId = p.Id
                  WHERE cp.CategoryId = ? AND p.StatusId = 1";
    
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$categoryId]);
    
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $products;
    }
    
    

    /**
     * Attach a category to a product.
     */
    public function attachCategoryToProduct(int $productId, string $categoryId): bool
    {
        $stmt = $this->conn->prepare("INSERT IGNORE INTO category_product (ProductId, CategoryId) VALUES (:productId, :categoryId)");
        return $stmt->execute([
            ':productId' => $productId,
            ':categoryId' => $categoryId
        ]);
    }

    /**
     * Detach a category from a product.
     */
    public function detachCategoryFromProduct(int $productId, string $categoryId): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM category_product WHERE ProductId = :productId AND CategoryId = :categoryId");
        return $stmt->execute([
            ':productId' => $productId,
            ':categoryId' => $categoryId
        ]);
    }

    /**
     * Sync a product's categories (remove old, insert new).
     */
    public function syncCategories(int $productId, array $categoryIds): bool
    {
        $this->conn->beginTransaction();

        try {
            // Remove existing links
            $this->conn->prepare("DELETE FROM category_product WHERE ProductId = :productId")
                      ->execute([':productId' => $productId]);

            // Re-insert
            $stmt = $this->conn->prepare("INSERT INTO category_product (ProductId, CategoryId) VALUES (:productId, :categoryId)");
            foreach ($categoryIds as $categoryId) {
                $stmt->execute([
                    ':productId' => $productId,
                    ':categoryId' => $categoryId
                ]);
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
}
