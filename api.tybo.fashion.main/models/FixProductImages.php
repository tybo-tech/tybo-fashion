<?php
class FixProductImages
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function allProducts()
    {
        $allImages = $this->allImages();

        $query = "SELECT 
                    Id,
                    images,
                    ProductId,
                    Name
                  FROM product
                  WHERE CompanyId = '80edddf9-6fc0-11eb-9698-12911df8ace9'";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            if ($stmt->rowCount()) {
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $updated = [];
                foreach ($items as &$item) {
                    $imagesFound = $this->filterProductImages($allImages, $item['ProductId']);
                    if (!empty($imagesFound)) {
                        // Update the images column with the found images
                        $item['images'] = json_encode($imagesFound);
                       $res = $this->updateProductImages($item['Id'], $item['images']);
                        if ($res) {
                            $updated[] = $item['Name'];
                        }
                    }
                }
                return $items;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function filterProductImages($allImages, $productId)
    {
        $filteredImages = [];
        foreach ($allImages as $image) {
            if ($image['OtherId'] == $productId) {
                $filteredImages[] = $image['Url'];
            }
        }
        return $filteredImages;
    }

    public function allImages()
    {
        $query = "SELECT 
                    Url,
                    OtherId
                  FROM images";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            if ($stmt->rowCount()) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function updateProductImages($productId, $imagesJson)
    {
        $query = "UPDATE product SET images = :images WHERE Id = :productId";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':images', $imagesJson);
            $stmt->bindParam(':productId', $productId);
            $stmt->execute();
            return true;
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }
}

