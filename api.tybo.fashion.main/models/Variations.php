<?php

class Variations
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function Create($data)
    {
        $query = "INSERT INTO variation (
            CompanyId,
            Name,
            VariationType,
            CompanyType,
            Description,
            CreateUserId,
            ModifyUserId,
            StatusId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        if (
            $stmt->execute([
                $data->CompanyId,
                $data->Name,
                $data->VariationType ?? 'Select',
                $data->CompanyType ?? '',
                $data->Description ?? '',
                $data->CreateUserId,
                $data->ModifyUserId,
                $data->StatusId ?? 1
            ])
        ) {
            $id = $this->conn->lastInsertId();
            return $this->GetById($id);
        }
        return ["ERROR"];
    }

    public function Update($data)
    {
        $query = "UPDATE variation SET
            Name = ?,
            VariationType = ?,
            CompanyType = ?,
            Description = ?,
            ModifyDate = NOW(),
            ModifyUserId = ?,
            StatusId = ?
        WHERE VariationId = ? AND CompanyId = ?";

        $stmt = $this->conn->prepare($query);
        if (
            $stmt->execute([
                $data->Name,
                $data->VariationType,
                $data->CompanyType,
                $data->Description,
                $data->ModifyUserId,
                $data->StatusId,
                $data->VariationId,
                $data->CompanyId
            ])
        ) {
            return $this->GetById($data->VariationId);
        }
        return ["ERROR"];
    }

    public function ListByCompanyId($companyId)
    {
        $stmt = $this->conn->prepare("SELECT * FROM variation WHERE CompanyId = ? ORDER BY CreateDate DESC");
        $stmt->execute([$companyId]);
        $variations = $stmt->fetchAll(PDO::FETCH_ASSOC) ?? [];
        if (count($variations) > 0) {
            foreach ($variations as &$variation) {
                $variation['Options'] = $this->ListOptions($variation['VariationId']);
            }
        }
        return $variations;
    }

    public function GetById($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM variation WHERE VariationId = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?? [];
    }

    public function ListAll()
    {
        $stmt = $this->conn->prepare("SELECT * FROM variation ORDER BY CreateDate DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function Delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM variation WHERE VariationId = ?");
        return $stmt->execute([$id]);
    }

    // ==== Variation Options CRUD ====

    public function AddOption($data)
    {
        $check = $this->GetByNameAndVariationId($data->Name, $data->VariationId);
        if (!empty($check)) {
            // Option already exists, return the existing option with an error message
            $check['ERROR'] = "Option already exists";
            return $check;
        }
        $query = "INSERT INTO variationoption (
            VariationId,
            Name,
            Description,
            ImageUrl,
            CreateUserId,
            ModifyUserId,
            StatusId
        ) VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        if (
            $stmt->execute([
                $data->VariationId,
                $data->Name,
                $data->Description ?? '',
                $data->ImageUrl ?? '',
                $data->CreateUserId,
                $data->ModifyUserId,
                $data->StatusId ?? 1
            ])
        ) {
            $lastId = $this->conn->lastInsertId();
            return $this->GetOptionById($lastId);
        }
        return ["ERROR"];
    }


    // This method is used to check if an option already exists
    private function GetByNameAndVariationId($name, $variationId)
    {
        $stmt = $this->conn->prepare("SELECT * FROM variationoption WHERE Name = ? AND VariationId = ?");
        $stmt->execute([$name, $variationId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?? [];
    }

    function GetOptionById($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM variationoption WHERE VariationOptionId = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?? [];
    }


    // Update option
    public function UpdateOption($data)
    {
        $query = "UPDATE variationoption SET
            Name = ?,
            Description = ?,
            ImageUrl = ?,
            ModifyDate = NOW(),
            ModifyUserId = ?,
            StatusId = ?
        WHERE VariationOptionId = ? AND VariationId = ?";

        $stmt = $this->conn->prepare($query);
        if (
            $stmt->execute([
                $data->Name,
                $data->Description,
                $data->ImageUrl,
                $data->ModifyUserId,
                $data->StatusId,
                $data->VariationOptionId,
                $data->VariationId
            ])
        ) {
            return $this->ListOptions($data->VariationId);
        }
        return ["ERROR"];
    }
    public function ListOptions($variationId)
    {
        $stmt = $this->conn->prepare("SELECT * FROM variationoption WHERE VariationId = ? ORDER BY Name");
        $stmt->execute([$variationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function DeleteOption($optionId)
    {
        $stmt = $this->conn->prepare("DELETE FROM variationoption WHERE VariationOptionId = ?");
        return $stmt->execute([$optionId]);
    }
}
