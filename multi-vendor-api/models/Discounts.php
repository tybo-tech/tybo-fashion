<?php

class Discounts
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function create($data)
    {
        $check = $this->getByNameAndParentId($data->ParentId, $data->Name);
        if (isset($check)) {
            return $check;
        }
        $query = "INSERT INTO Discounts (
            ParentId,
            StyleId,
            CollectionId,
            Name,
            Method,
            DiscountValueType,
            DiscountValue,
            DiscountType,
            DiscountCode,
            StartDate,
            EndDate,
            StartTime,
            EndTime,
            MaxUsesPerUser,
            MaxUses
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute([
                    $data->ParentId,
                    $data->StyleId,
                    $data->CollectionId,
                    $data->Name,
                    $data->Method,
                    $data->DiscountValueType,
                    $data->DiscountValue,
                    $data->DiscountType,
                    $data->DiscountCode,
                    $data->StartDate,
                    $data->EndDate,
                    $data->StartTime,
                    $data->EndTime,
                    $data->MaxUsesPerUser,
                    $data->MaxUses
                ])
            ) {
                return $this->getById($this->conn->lastInsertId());
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function update($data)
    {
        $query = "UPDATE Discounts SET
            StyleId = ?,
            CollectionId = ?,
            Name = ?,
            Method = ?,
            DiscountValueType = ?,
            DiscountValue = ?,
            DiscountType = ?,
            DiscountCode = ?,
            StartDate = ?,
            EndDate = ?,
            StartTime = ?,
            EndTime = ?,
            MaxUsesPerUser = ?,
            MaxUses = ?
            WHERE Id = ?";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute([
                    $data->StyleId,
                    $data->CollectionId,
                    $data->Name,
                    $data->Method,
                    $data->DiscountValueType,
                    $data->DiscountValue,
                    $data->DiscountType,
                    $data->DiscountCode,
                    $data->StartDate,
                    $data->EndDate,
                    $data->StartTime,
                    $data->EndTime,
                    $data->MaxUsesPerUser,
                    $data->MaxUses,
                    $data->Id
                ])
            ) {
                return $this->getById($data->Id);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getByParentId($parentId)
    {
        $query = "SELECT * FROM Discounts WHERE ParentId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$parentId]);
            if ($stmt->rowCount()) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getById($id)
    {
        $query = "SELECT * FROM Discounts WHERE Id = ?";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$id]);
            if ($stmt->rowCount()) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getByNameAndParentId($parentId, $name)
    {
        $query = "SELECT * FROM Discounts WHERE ParentId = ? AND Name = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$parentId, $name]);
            if ($stmt->rowCount()) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function delete($id)
    {
        $query = "DELETE FROM Discounts WHERE Id = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$id]);
            return ($stmt->rowCount() > 0);
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getActiveDiscounts($parentId)
    {
        $query = "SELECT * FROM Discounts
              WHERE TIMESTAMP(StartDate, StartTime) <= NOW()
                AND TIMESTAMP(EndDate, EndTime) >= NOW()
                AND ParentId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$parentId]);
            return $stmt->rowCount() ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }
public function getByCollectionId($collectionId)
{
    $query = "SELECT * FROM Discounts 
              WHERE TIMESTAMP(StartDate, StartTime) <= NOW()
                AND TIMESTAMP(EndDate, EndTime) >= NOW()
                AND CollectionId = ?";

    try {
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$collectionId]);
        return $stmt->rowCount() ? $stmt->fetch(PDO::FETCH_ASSOC) : [];
    } catch (Exception $e) {
        return [
            'error' => true,
            'message' => $e->getMessage(),
            'sql' => $query,
            'info' => $e->errorInfo ?? null
        ];
    }
}


    /** NEW METHODS **/

    public function getAutomaticDiscounts($parentId)
    {
        $query = "SELECT * FROM Discounts
                  WHERE Method = 'Automatic'
                    AND CONCAT(StartDate, ' ', StartTime) <= NOW()
                    AND CONCAT(EndDate, ' ', EndTime) >= NOW()
                    AND ParentId = ?
                    ";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$parentId]);
            return $stmt->rowCount() ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getByDiscountCode($code, $parentId)
    {
        $query = "SELECT * FROM Discounts WHERE DiscountCode = ? AND ParentId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$code, $parentId]);
            return $stmt->rowCount() ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getByType($type)
    {
        $query = "SELECT * FROM Discounts WHERE DiscountType = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$type]);
            return $stmt->rowCount() ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function validateDiscount($code)
    {
        $query = "SELECT * FROM Discounts
                  WHERE DiscountCode = ?
                    AND CONCAT(StartDate, ' ', StartTime) <= NOW()
                    AND CONCAT(EndDate, ' ', EndTime) >= NOW()";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$code]);
            return $stmt->rowCount() ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function findByCollectionId($collectionId, array $discounts)
    {
        foreach ($discounts as $discount) {
            if ($discount['CollectionId'] === $collectionId) {
                return $discount;
            }
        }
        return null;
    }

    public function getActiveDiscountForProduct(string $productId): ?array
{
    $query = "
        SELECT d.*
        FROM category_product cp
        INNER JOIN Discounts d ON cp.CategoryId = d.CollectionId
        WHERE cp.ProductId = ?
          AND d.Method = 'Automatic'
          AND TIMESTAMP(d.StartDate, d.StartTime) <= NOW()
          AND TIMESTAMP(d.EndDate, d.EndTime) >= NOW()
        LIMIT 1
    ";

    try {
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$productId]);
        return $stmt->rowCount() ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
    } catch (Exception $e) {
        return [
            'error' => true,
            'message' => $e->getMessage(),
            'info' => $e->errorInfo ?? null,
        ];
    }
}


}
