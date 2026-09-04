<?php
require_once 'Job.php';


class JobItem
{
    //DB Stuff
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    //Add user
    public function Create($model)
    {

        $JobItemId = getUuid($this->conn);


        $query = "INSERT INTO jobitem(
                    JobItemId,
                    JobId,
                    CompanyId,
                    FeaturedImageUrl,
                    Measurements,
                    Metadata,
                    Size,
                    Colour,
                    ItemName,
                    ItemType,
                    UnitPrice,
                    Quantity,
                    SubTotal,
                    CreateUserId,
                    ModifyUserId,
                    StatusId
                        )
                        VALUES(
                        ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
                        )
                ";
        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(
                    array(
                        $JobItemId,
                        $model->JobId,
                        $model->CompanyId,
                        $model->FeaturedImageUrl,
                        json_encode($model->Measurements),
                        json_encode($model->Metadata),
                        $model->Size,
                        $model->Colour,
                        $model->ItemName,
                        $model->ItemType,
                        $model->UnitPrice,
                        $model->Quantity,
                        $model->SubTotal,
                        $model->CreateUserId,
                        $model->ModifyUserId,
                        $model->StatusId
                    )
                )
            ) {
                return $this->getById($JobItemId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }




    public function Update($model)
    {
        $unitPrice = number_format((float) $model->UnitPrice, 2, '.', '');
        $query = "UPDATE
        jobitem
         SET
        JobId = ?,
        CompanyId = ?,
        FeaturedImageUrl = ?,
        Measurements = ?,
        Metadata = ?,
        Size = ?,
        Colour = ?,
        ItemName = ?,
        ItemType = ?,
        UnitPrice = ?,
        Quantity = ?,
        SubTotal = ?,
        CreateUserId = ?,
        ModifyUserId = ?,
        ModifyDate = NOW(),
        StatusId = ?
        WHERE
        JobItemId = ?
         ";

        try {
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(
                    array(
                        $model->JobId,
                        $model->CompanyId,
                        $model->FeaturedImageUrl,
                        json_encode($model->Measurements),
                        json_encode($model->Metadata),
                        $model->Size,
                        $model->Colour,
                        $model->ItemName,
                        $model->ItemType,
                        $unitPrice,
                        $model->Quantity,
                        $model->SubTotal,
                        $model->CreateUserId,
                        $model->ModifyUserId,
                        $model->StatusId,
                        $model->JobItemId


                    )
                )
            ) {
                return $this->getById($model->JobItemId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getById($JobItemId, $details = false)
    {
        $query = "SELECT * FROM jobitem WHERE JobItemId =?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($JobItemId));

        if ($stmt->rowCount()) {
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            $item["Measurements"] = json_decode($item["Measurements"]);
            $item["Metadata"] = json_decode($item["Metadata"]);
            if($details){
                $job = new Job($this->conn);
                $item["Job"] = $job->GetJobById($item["JobId"]);
            }
            return $item;
        }
    }
    public function getByJobId($JobId)
    {
        $query = "SELECT * FROM jobitem WHERE JobId =?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($JobId));
        $results = array();
        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as $item) {
                $item["Measurements"] = json_decode($item["Measurements"]);
                $item["Metadata"] = json_decode($item["Metadata"]);
                array_push($results, $item);
            }
        }
        return $results;
    }
    public function getByStatus($StatusId)
    {
        // Join with the job on jobid
        $query = "
     SELECT 
    j.JobId,
    j.JobNo AS JobNo,
    j.TotalCost,
    j.DueDate,
    j.TotalDays,
    j.Status AS JobStatus,
    ji.JobItemId,
    ji.ItemName,
    ji.ItemType,
    ji.UnitPrice,
    ji.Quantity,
    ji.SubTotal,
    JSON_UNQUOTE(JSON_EXTRACT(ji.Metadata, '$.AssignedToName')) AS AssignedToName,
    ji.StatusId AS JobItemStatus,
    c.CustomerId,
    c.Name AS CustomerName,
    c.Surname AS CustomerSurname,
    c.Email AS CustomerEmail
FROM 
    job j
JOIN 
    jobitem ji ON j.JobId = ji.JobId
JOIN 
    customer c ON j.CustomerId = c.CustomerId
WHERE 
    ji.StatusId = ?
ORDER BY
    ji.CreateDate DESC;

        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($StatusId));
        $results = array();
        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as $item) {
                $item["Measurements"] = json_decode($item["Measurements"]);
                $item["Metadata"] = json_decode($item["Metadata"]);
                array_push($results, $item);
            }
        }
        return $results;
    }

    //Metadata: Get by Metadata.AssignedTo where metadata is JSON column.
    public function getByAssignedTo($AssignedTo)
    {
        $query = "SELECT * FROM jobitem WHERE JSON_EXTRACT(Metadata, '$.AssignedTo') = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($AssignedTo));
        $results = array();
        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as $item) {
                $item["Measurements"] = json_decode($item["Measurements"]);
                $item["Metadata"] = json_decode($item["Metadata"]);
                array_push($results, $item);
            }
        }
        return $results;
    }
    public function Delete($JobId)
    {
        $query = "Delete  FROM jobitem WHERE JobItemId =?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($JobId));
        return true;
    }


    public function getByCompanyId($CompanyId)
    {
        $query = "
        SELECT * 
        FROM
            jobitem
        WHERE
            CompanyId = ?
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($CompanyId));

        if ($stmt->rowCount()) {
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
    public function getTopSellingByCompanyId($CompanyId)
    {
        $query = "
        SELECT
        `ProductId`,
        `ProductName`,
        COUNT(`ProductId`) AS 'Times',
        SUM(`Quantity`) AS 'Quantity',
        SUM(`subTotal`) AS 'Total'
        FROM
            jobitem
        WHERE
            CompanyId = ?
        GROUP BY
            `ProductId`
        ORDER BY
        SUM(`Quantity`)
        DESC
            
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($CompanyId));

        if ($stmt->rowCount()) {
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
}
