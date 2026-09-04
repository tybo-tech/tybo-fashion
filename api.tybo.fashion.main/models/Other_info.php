<?php

class Other_info
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function Add($model)
    {
        $query = "INSERT INTO other_info(
                    Name,
                    ItemType,
                    ImageUrl,
                    ParentId,
                    Notes,
                    ItemValue,
                    Status,
                    Decription,
                    Rules,
                    ItemCode
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute([
                $model->Name,
                $model->ItemType,
                $model->ImageUrl,
                $model->ParentId,
                $model->Notes,
                json_encode($model->ItemValue),
                $model->Status,
                $model->Decription,
                $model->Rules,
                $model->ItemCode
            ])) {
                $Id = $this->conn->lastInsertId();
                return $this->getById($Id);
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function Update($model)
    {
        $query = "UPDATE other_info SET
                    Name = ?,
                    ItemType = ?,
                    ImageUrl = ?,
                    ParentId = ?,
                    Notes = ?,
                    ItemValue = ?,
                    Status = ?,
                    Decription = ?,
                    Rules = ?,
                    ItemCode = ?
                  WHERE Id = ?";
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute([
                $model->Name,
                $model->ItemType,
                $model->ImageUrl,
                $model->ParentId,
                $model->Notes,
                json_encode($model->ItemValue),
                $model->Status,
                $model->Decription,
                $model->Rules,
                $model->ItemCode,
                $model->Id
            ])) {
                return $this->getById($model->Id);
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function getById($Id)
    {
        $query = "SELECT * FROM other_info WHERE Id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$Id]);

        if ($stmt->rowCount()) {
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            $item["ItemValue"] = json_decode($item["ItemValue"]);
            return $item;
        }
    }

    public function getByName($Name, $ParentId, $ItemType)
    {
        $query = "SELECT * FROM other_info WHERE Name = ? AND ParentId = ? AND ItemType = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$Name, $ParentId, $ItemType]);

        if ($stmt->rowCount()) {
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            $item["ItemValue"] = json_decode($item["ItemValue"]);
            return $item;
        }
    }

    public function delete($Id)
    {
        $query = "DELETE FROM other_info WHERE Id = ?";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$Id]);
            return ["deleted" => $stmt->rowCount() > 0];
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function search($ParentId, $ItemType)
    {
        $query = "SELECT * FROM other_info WHERE ParentId = ? AND ItemType = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$ParentId, $ItemType]);

        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as &$item) {
                $item["ItemValue"] = json_decode($item["ItemValue"]);
            }
            return $items;
        }
        return [];
    }

}