<?php
class ProductMutation
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }


    public function Create($model)
    {
        $isExist = $this->isExist($model->ProductId);
        if ($isExist) {
            return ["ERROR", "Product already exists"];
        }
        $query = "INSERT INTO product (
            ProductId,
            CompanyId,
            Name,
            RegularPrice,
            TotalStock,
            PriceFrom,
            PriceTo,
            Description,
            Code,
            ProductSlug,
            PickId,
            ReturnPolicy,
            FeaturedImageUrl,
            Slug,
            IsJustInTime,
            StockType,
            ShowOnline,
            EstimatedDeliveryDays,
            ShowRemainingItems,
            IsFeatured,
            OrderLimit,
            SupplierId,
            ProductType,
            ProductStatus,
            CreateUserId,
            ModifyUserId,
            StatusId,
            Images,
            Metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute([
                    $model->ProductId,
                    $model->CompanyId,
                    $model->Name,
                    $model->RegularPrice,
                    $model->TotalStock,
                    $model->PriceFrom,
                    $model->PriceTo,
                    $model->Description,
                    $model->Code,
                    $model->ProductSlug,
                    $model->PickId,
                    $model->ReturnPolicy,
                    $model->FeaturedImageUrl,
                    $model->Slug,
                    $model->IsJustInTime,
                    $model->StockType,
                    $model->ShowOnline,
                    $model->EstimatedDeliveryDays,
                    $model->ShowRemainingItems,
                    $model->IsFeatured,
                    $model->OrderLimit,
                    $model->SupplierId,
                    $model->ProductType,
                    $model->ProductStatus,
                    $model->CreateUserId,
                    $model->ModifyUserId,
                    $model->StatusId,
                    json_encode($model->Images),
                    json_encode($model->Metadata)
                ])
            ) {
                $id = $this->conn->lastInsertId();
                $this->updateSlug($model->Name, $id);
                return $this->get($id);
            }
        } catch (Exception $e) {
            return ["ERROR", $e->getMessage()];
        }
    }

    public function Update($model)
    {
        $query = "UPDATE product SET
            CompanyId = ?,
            Name = ?,
            RegularPrice = ?,
            TotalStock = ?,
            PriceFrom = ?,
            PriceTo = ?,
            Description = ?,
            Code = ?,
            ProductSlug = ?,
            PickId = ?,
            ReturnPolicy = ?,
            FeaturedImageUrl = ?,
            Slug = ?,
            IsJustInTime = ?,
            StockType = ?,
            ShowOnline = ?,
            EstimatedDeliveryDays = ?,
            ShowRemainingItems = ?,
            IsFeatured = ?,
            OrderLimit = ?,
            SupplierId = ?,
            ProductType = ?,
            ProductStatus = ?,
            ModifyUserId = ?,
            StatusId = ?,
            Images = ?,
            Metadata = ?,
            ModifyDate = NOW()
        WHERE ProductId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute([
                    $model->CompanyId,
                    $model->Name,
                    $model->RegularPrice,
                    $model->TotalStock,
                    $model->PriceFrom,
                    $model->PriceTo,
                    $model->Description,
                    $model->Code,
                    $model->ProductSlug,
                    $model->PickId,
                    $model->ReturnPolicy,
                    $model->FeaturedImageUrl,
                    $model->Slug,
                    $model->IsJustInTime,
                    $model->StockType,
                    $model->ShowOnline,
                    $model->EstimatedDeliveryDays,
                    $model->ShowRemainingItems,
                    $model->IsFeatured,
                    $model->OrderLimit,
                    $model->SupplierId,
                    $model->ProductType,
                    $model->ProductStatus,
                    $model->ModifyUserId,
                    $model->StatusId,
                    json_encode($model->Images),
                    json_encode($model->Metadata),
                    $model->ProductId
                ])
            ) {
                return $this->get($model->Id);
            }
        } catch (Exception $e) {
            return ["ERROR", $e->getMessage()];
        }
    }

    function UpdateRange($models)
    {
        $response = [];
        foreach ($models as $model) {
            // Call the Update method for each model
            $response[] = $this->Update($model);
        }
        return $response;
    }
    private function updateSlug($name, $id)
    {
        $slug = $this->createSlug($name, $id);
        $stmt = $this->conn->prepare("UPDATE product SET Slug = ? WHERE Id = ?");
        $stmt->execute([$slug, $id]);
    }

    private function createSlug($name, $id)
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        return str_replace('--', '-', $slug) . '-' . $id;
    }



    public function delete($ProductId)
    {
        $existingProduct = $this->isExist($ProductId);
        if (!$existingProduct) {
            return ["success" => false, "message" => "Product not found"];
        }

        try {
            // Start transaction
            $this->conn->beginTransaction();

            // Clear related records
            $id = $existingProduct['Id'];
            $this->clearDependencies($id);

            // Delete the main product
            $stmt = $this->conn->prepare("DELETE FROM product WHERE ProductId = ?");
            $stmt->execute([$ProductId]);

            // Commit transaction
            $this->conn->commit();

            return ["success" => true, "deleted" => $stmt->rowCount() > 0];
        } catch (Exception $e) {
            // Rollback on failure
            $this->conn->rollBack();
            return ["success" => false, "message" => "Deletion failed: " . $e->getMessage()];
        }
    }

    private function clearDependencies($productId)
    {
        $tables = [
            "product_variation",
            "product_variation_option",
            "category_product"
        ];

        foreach ($tables as $table) {
            $stmt = $this->conn->prepare("DELETE FROM $table WHERE ProductId = ?");
            $stmt->execute([$productId]);
        }
    }

    private function get($ProductId)
    {
        $stmt = $this->conn->prepare("SELECT * FROM product WHERE Id = ?");
        $stmt->execute([$ProductId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    private function isExist($ProductId)
    {
        $stmt = $this->conn->prepare("SELECT * FROM product WHERE ProductId = ?");
        $stmt->execute([$ProductId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    function feature($productId, $isFeatured)
    {
        $stmt = $this->conn->prepare("UPDATE product SET IsFeatured = ? WHERE Id = ?");
        try {
            $stmt->execute([$isFeatured, $productId]);
            return ["featured" => $stmt->rowCount() > 0];
        } catch (Exception $e) {
            return ["ERROR", $e->getMessage()];
        }
    }
}
