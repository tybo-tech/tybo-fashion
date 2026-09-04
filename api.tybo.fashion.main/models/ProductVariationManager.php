<?php

class ProductVariationManager
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    // ------------------------
    // ProductVariation Methods
    // ------------------------

    public function addProductVariation($productId, $variationId, $userId)
    {
        $query = "INSERT INTO product_variation (
            ProductId,
            VariationId,
            CreateUserId,
            ModifyUserId,
            StatusId
        ) VALUES (?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $productId,
            $variationId,
            $userId,
            $userId,
            1
        ]);
    }

    public function removeProductVariation($productId, $variationId)
    {
        $query = "DELETE FROM product_variation WHERE ProductId = ? AND VariationId = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$productId, $variationId]);
    }

    public function getVariationsByProduct($productId)
    {
        $query = "
            SELECT v.*
            FROM product_variation pv
            JOIN variation v ON pv.ProductId = p.Id
            WHERE pv.ProductId = ?
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$productId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function clearVariationsByProduct($productId)
    {
        $stmt = $this->conn->prepare("DELETE FROM product_variation WHERE ProductId = ?");
        return $stmt->execute([$productId]);
    }

    public function getProductVariations($productId)
    {
        // Step 1: Get all variations linked to this product
        $variationQuery = "
    SELECT v.*
    FROM product_variation pv
    JOIN variation v ON pv.VariationId = v.VariationId
    WHERE pv.ProductId = ?
";
        $stmt = $this->conn->prepare($variationQuery);
        $stmt->execute([$productId]);
        $variations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Step 2: For each variation, get its selected options
        foreach ($variations as &$variation) {
            $optionQuery = "
        SELECT vo.*
        FROM product_variation_option pvo
        JOIN variationoption vo ON pvo.VariationOptionId = vo.VariationOptionId
        WHERE pvo.ProductId = ? AND vo.VariationId = ?
    ";
            $optStmt = $this->conn->prepare($optionQuery);
            $optStmt->execute([$productId, $variation['VariationId']]);
            $variation['Options'] = $optStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $variations;
    }

    // -------------------------------
    // ProductVariationOption Methods
    // -------------------------------

    public function addProductVariationOption($productId, $variationOptionId, $userId)
    {
        $query = "INSERT INTO product_variation_option (
            ProductId,
            VariationOptionId,
            CreateUserId,
            ModifyUserId,
            StatusId
        ) VALUES (?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            $productId,
            $variationOptionId,
            $userId,
            $userId,
            1
        ]);
    }

    public function removeProductVariationOption($productId, $variationOptionId)
    {
        $query = "DELETE FROM product_variation_option WHERE ProductId = ? AND VariationOptionId = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$productId, $variationOptionId]);
    }

    public function getVariationOptionsByProduct($productId, $variationType)
    {
        $query = "
            SELECT vo.*
            FROM product_variation_option pvo
            JOIN variationoption vo ON pvo.VariationOptionId = vo.VariationOptionId
            WHERE pvo.ProductId = ? and VariationType = >
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$productId, $variationType]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function clearVariationOptionsByProduct($productId)
    {
        $stmt = $this->conn->prepare("DELETE FROM product_variation_option WHERE ProductId = ?");
        return $stmt->execute([$productId]);
    }

    public function saveProductVariationPayload($productId, array $payload, $userId)
    {
        // Clear existing variation links
        $this->clearVariationsByProduct($productId);
        $this->clearVariationOptionsByProduct($productId);

        foreach ($payload as $item) {
            if (!isset($item->VariationId) || !isset($item->OptionIds)) {
                continue;
            }

            $variationId = $item->VariationId;
            $optionIds = $item->OptionIds;

            $this->addProductVariation($productId, $variationId, $userId);

            foreach ($optionIds as $optionId) {
                $this->addProductVariationOption($productId, $optionId, $userId);
            }
        }

        return true;
    }


}
