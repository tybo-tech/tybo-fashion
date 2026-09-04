<?php

class VariationOption
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function Create($data)
    {
        $query = "INSERT INTO variationoption (
            VariationId, Name, Description, ImageUrl, CreateUserId, ModifyUserId, StatusId
        ) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute([
                    $data->VariationId,
                    $data->Name,
                    $data->Description,
                    $data->ImageUrl,
                    $data->CreateUserId,
                    $data->ModifyUserId,
                    $data->StatusId
                ])
            ) {
                $data->VariationOptionId = $this->conn->lastInsertId();
                return $this->GetById($data->VariationOptionId);
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function Update($data)
    {
        $query = "UPDATE variationoption SET 
            Name = ?, 
            Description = ?, 
            ImageUrl = ?, 
            ModifyUserId = ?, 
            ModifyDate = NOW(), 
            StatusId = ?
            WHERE VariationOptionId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data->Name,
                $data->Description,
                $data->ImageUrl,
                $data->ModifyUserId,
                $data->StatusId,
                $data->VariationOptionId
            ]);
            return $this->GetById($data->VariationOptionId);
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function GetById($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM variationoption WHERE VariationOptionId = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function GetByVariationId($variationId)
    {
        $stmt = $this->conn->prepare("SELECT * FROM variationoption WHERE VariationId = ? AND StatusId = 1");
        $stmt->execute([$variationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function Delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM variationoption WHERE VariationOptionId = ?");
        $stmt->execute([$id]);
        return ["success" => true];
    }
}
