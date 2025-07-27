<?php

class Company
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }


    public function Create(
        $data
    ) {
        # code...
        $query = "INSERT INTO company
        (
        CompanyId, 
        Name, 
        Slug,
        Dp, 
        CompanyType, 
        IsDeleted, 
        CreateUserId,
        ModifyUserId, 
        StatusId) 
        VALUES (?,?,?,?,?,?,?,?,?)
        ";
        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(array(
                    $data->CompanyId,
                    $data->Name,
                    $data->Slug,
                    $data->Dp,
                    $data->CompanyType,
                    $data->IsDeleted,
                    $data->CreateUserId,
                    $data->ModifyUserId,
                    $data->StatusId
                ))
            ) {
                return $this->GetById($data->CompanyId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function Update(
        $data
    ) {
        # code...
        $query = "UPDATE company SET        
        Name= ?   ,
        Slug= ?   ,
        Description= ?   ,
        Dp = ?   ,
        Background = ?,
        Color = ?,
        Phone = ?,
        Email = ?,
        AddressLine = ?,
        AddressLine2 = ?,
        City = ?,
        PostalCode = ?,
        Location = ?,
        BankName = ?,
        BankAccNo = ?,
        BankAccHolder = ?,
        Metadata = ?,
        BankBranch = ?,
        IsDeleted= ?   ,
        CreateUserId= ?   ,
        ModifyUserId= ?   ,
        StatusId= ?   ,
        ModifyDate = now()
        WHERE CompanyId = ?      
        ";
        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(array(
                    $data->Name,
                    $data->Slug,
                    $data->Description,
                    $data->Dp,
                    $data->Background,
                    $data->Color,
                    $data->Phone,
                    $data->Email,
                    $data->AddressLine,
                    $data->AddressLine2,
                    $data->City,
                    $data->PostalCode,
                    $data->Location,
                    $data->BankName,
                    $data->BankAccNo,
                    $data->BankAccHolder,
                    json_encode($data->Metadata),
                    $data->BankBranch,
                    $data->IsDeleted,
                    $data->CreateUserId,
                    $data->ModifyUserId,
                    $data->StatusId,
                    $data->CompanyId
                ))
            ) {
                return $this->GetById($data->CompanyId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function GetDetailedById(
        $CompanyId,
        $IsDeleted,
        $StatusId
    ) {
        # code...
        $query = "SELECT * FROM company WHERE CompanyId = ? AND IsDeleted = ? AND StatusId = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($CompanyId, $IsDeleted, $StatusId));
            //    $promotion = new Promotion($this->conn);

            if ($stmt->rowCount()) {
                $company =  $stmt->fetch(PDO::FETCH_ASSOC);
                $company['Metadata'] = json_decode($company['Metadata']);
                //   $company['Promotions'] = $promotion->GetByCompanyId($company['CompanyId'], 1);
                return $company;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function GetById(
        $CompanyId
    ) {
        # code...
        $query = "SELECT * FROM company WHERE CompanyId = ? OR Slug = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($CompanyId, $CompanyId));

            if ($stmt->rowCount()) {
                $data =  $stmt->fetch(PDO::FETCH_ASSOC);
                $data['Metadata'] = json_decode($data['Metadata']); 
                return $data;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }
    public function active() {
        # code...
        $query = "SELECT 
        Name,
        Dp,
        Slug,
        CompanyId
         FROM company WHERE StatusId = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array(1));

            if ($stmt->rowCount()) {
                return  $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }
    public function simple($id) {
        # code...
        $query = "SELECT 
        Name,
        Dp,
        Slug,
        Phone,
        Email,
        Metadata,
        CompanyId
         FROM company WHERE CompanyId = ? or Slug = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$id, $id]);

            if ($stmt->rowCount()) {
                $data =  $stmt->fetch(PDO::FETCH_ASSOC);
                $data['Metadata'] = json_decode($data['Metadata']);
                return $data;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getCounts($CompanyId)
{
    // SQL query to get the counts for each table
    $query = "
        SELECT 
            (SELECT COUNT(*) FROM product WHERE CompanyId = ?) AS ProductCount,
            (SELECT COUNT(*) FROM customer WHERE CompanyId = ?) AS CustomerCount,
            (SELECT COUNT(*) FROM user WHERE CompanyId = ?) AS UserCount,
            (SELECT COUNT(*) FROM job WHERE CompanyId = ?) AS JobCount,
            (SELECT COUNT(*) FROM other_info WHERE ParentId = ? and ItemType = 'Category') AS CategoryCount,
            (SELECT COUNT(*) FROM other_info WHERE ParentId = ? and ItemType = 'Collections') AS CollectionCount,
            (SELECT COUNT(*) FROM jobitem WHERE CompanyId = ?) AS JobItemCount
    ";

    $stmt = $this->conn->prepare($query);
    $stmt->execute([$CompanyId, $CompanyId, $CompanyId, $CompanyId, $CompanyId, $CompanyId, $CompanyId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result;
}

}
