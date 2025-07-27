<?php

class Customer
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    private function decodeCustomerData(array $item): array
    {
        $item["Measurements"] = json_decode($item["Measurements"] ?? '[]', true);
        $item["Metadata"] = json_decode($item["Metadata"] ?? '[]', true);
        return $item;
    }

    public function getCustomerById($customerId)
    {
        if (!$customerId) {
            return null;
        }

        $query = "SELECT * FROM customer WHERE CustomerId = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$customerId]);

        if ($stmt->rowCount()) {
            return $this->decodeCustomerData($stmt->fetch(PDO::FETCH_ASSOC));
        }

        return null;
    }

    public function getByEmail($email, $companyId)
    {
        $query = "SELECT * FROM customer WHERE Email = ? AND CompanyId = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$email, $companyId]);

        if ($stmt->rowCount()) {
            return $this->decodeCustomerData($stmt->fetch(PDO::FETCH_ASSOC));
        }

        return null;
    }

    public function checkIfCustomerExists($email, $companyId)
    {
        if (!$email) return null;

        $query = "SELECT * FROM customer WHERE Email = ? AND CompanyId = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$email, $companyId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function add($model)
    {
        $customerId = getUuid($this->conn);
        $userToken = bin2hex(openssl_random_pseudo_bytes(16));
        $hashedPassword = password_hash($model->Password, PASSWORD_BCRYPT);

        $query = "INSERT INTO customer (
            CustomerId, CompanyId, CustomerType, Name, Surname, Email, PhoneNumber, Password, Dp,
            AddressLineHome, Measurements, Metadata, AddressUrlHome, AddressLineWork, AddressUrlWork,
            BuildingType, AddressLine2, Suburb, City, PostalCode, CompanyName, UserId,
            CreateUserId, ModifyUserId, StatusId, UserToken
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $customerId,
                $model->CompanyId,
                $model->CustomerType,
                $model->Name,
                $model->Surname,
                $model->Email,
                $model->PhoneNumber,
                $hashedPassword,
                $model->Dp,
                $model->AddressLineHome,
                json_encode($model->Measurements),
                json_encode($model->Metadata),
                $model->AddressUrlHome,
                $model->AddressLineWork,
                $model->AddressUrlWork,
                $model->BuildingType,
                $model->AddressLine2,
                $model->Suburb,
                $model->City,
                $model->PostalCode,
                $model->CompanyName,
                $model->UserId,
                $model->CreateUserId,
                $model->ModifyUserId,
                $model->StatusId,
                $userToken
            ]);
            return $this->getCustomerById($customerId);
        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    public function update($model)
    {
        $query = "UPDATE customer SET
            CompanyId = ?, CustomerType = ?, Name = ?, Surname = ?, Email = ?, PhoneNumber = ?,
            Password = ?, Dp = ?, AddressLineHome = ?, Measurements = ?, Metadata = ?, AddressUrlHome = ?,
            AddressLineWork = ?, AddressUrlWork = ?, BuildingType = ?, AddressLine2 = ?, Suburb = ?, City = ?,
            PostalCode = ?, CompanyName = ?, UserId = ?, CreateUserId = ?, ModifyUserId = ?, StatusId = ?,
            UserToken = ?, ModifyDate = NOW()
        WHERE CustomerId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $model->CompanyId,
                $model->CustomerType,
                $model->Name,
                $model->Surname,
                $model->Email,
                $model->PhoneNumber,
                password_hash($model->Password, PASSWORD_BCRYPT),
                $model->Dp,
                $model->AddressLineHome,
                json_encode($model->Measurements),
                json_encode($model->Metadata),
                $model->AddressUrlHome,
                $model->AddressLineWork,
                $model->AddressUrlWork,
                $model->BuildingType,
                $model->AddressLine2,
                $model->Suburb,
                $model->City,
                $model->PostalCode,
                $model->CompanyName,
                $model->UserId,
                $model->CreateUserId,
                $model->ModifyUserId,
                $model->StatusId,
                $model->UserToken,
                $model->CustomerId
            ]);

            $this->updateUser($model);
            $data = $this->getCustomerById($model->CustomerId);
            $data["UserUpdate"] = true;
            return $data;

        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    public function updateUser($model)
    {
        $query = "UPDATE user SET
            Name = ?, Surname = ?, Email = ?, PhoneNumber = ?, Dp = ?, AddressLineHome = ?,
            Measurements = ?, Metadata = ?, AddressUrlHome = ?, AddressLineWork = ?, AddressUrlWork = ?,
            ModifyUserId = ?, AddressLine2 = ?, BuildingType = ?, City = ?, CompanyName = ?, PostalCode = ?,
            ModifyDate = NOW()
        WHERE UserId = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $model->Name,
                $model->Surname,
                $model->Email,
                $model->PhoneNumber,
                $model->Dp,
                $model->AddressLineHome,
                json_encode($model->Measurements),
                json_encode($model->Metadata),
                $model->AddressUrlHome,
                $model->AddressLineWork,
                $model->AddressUrlWork,
                $model->ModifyUserId,
                $model->AddressLine2,
                $model->BuildingType,
                $model->City,
                $model->CompanyName,
                $model->PostalCode,
                $model->UserId
            ]);
            return true;
        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }

    public function getCustomers($companyId, $customerType)
{
    $query = "SELECT CustomerId, Name, PhoneNumber, CreateDate
              FROM customer
              WHERE CompanyId = ? AND CustomerType = ?
              ORDER BY CreateDate DESC";

    try {
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$companyId, $customerType]);

        $customers = $stmt->fetchAll(PDO::FETCH_ASSOC); // ← just fetch

        // Log for debug
        // error_log("Customers fetched: " . count($customers));
        // error_log("Sample: " . json_encode(array_slice($customers, 0, 1)));

        return $customers ?: []; // ← safely return empty array if none
    } catch (Exception $e) {
        return ["error" => true, "message" => $e->getMessage()];
    }
}


    public function getCustomersByUser($userId)
    {
        $query = "SELECT * FROM customer WHERE UserId = ? ORDER BY ModifyDate DESC";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$userId]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            return array_map([$this, 'decodeCustomerData'], $results);
        } catch (Exception $e) {
            return ["error" => true, "message" => $e->getMessage()];
        }
    }
}
