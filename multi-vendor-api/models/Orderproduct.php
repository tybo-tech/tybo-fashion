<?php

class Orderproduct
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }
    public function add(
        $model,
        $ordersId

    ) {

        $Id = getUuid($this->conn);
        $UnitPrice = number_format((float) $model->UnitPrice, 2, '.', '');
        $SubTotal = number_format((float) $model->SubTotal, 2, '.', '');

        $query = "
        INSERT INTO orderproduct(
            Id,
            OrderId,
            ProductId,
            CompanyId,
            ProductName,
            ProductType,
            FeaturedImageUrl,
            CustomerId,
            Measurements,
            Size,
            Colour,
            ColorCode,
            UnitPrice,
            Quantity,
            SubTotal,
            CreateUserId,
            ModifyUserId,
            StatusId
        )
        VALUES(
        ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
         )
";
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute(array(
                $Id,
                $ordersId,
                $model->ProductId,
                $model->CompanyId,
                $model->ProductName,
                $model->ProductType,
                $model->FeaturedImageUrl,
                $model->CustomerId,
                json_encode($model->Measurements),
                $model->Size,
                $model->Colour,
                $model->ColorCode,
                $UnitPrice,
                $model->Quantity,
                $SubTotal,
                $model->CreateUserId,
                $model->ModifyUserId,
                $model->StatusId
            ))) {
                return $this->getById($Id);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }




    public function Update(
        $model
    ) {
        $UnitPrice = number_format((float) $model->UnitPrice, 2, '.', '');
        $SubTotal = number_format((float) $model->SubTotal, 2, '.', '');
        $query = "UPDATE
        orderproduct
    SET
            OrderId = ?,
            ProductId = ?,
            CompanyId = ?,
            ProductName = ?,
            ProductType = ?,
            FeaturedImageUrl = ?,
            CustomerId = ?,
            Measurements = ?,
            Size = ?,
            Colour = ?,
            ColorCode = ?,
            UnitPrice = ?,
            Quantity = ?,
            SubTotal = ?,
            CreateUserId = ?,
            ModifyUserId = ?,
            StatusId = ?,
        ModifyDate = NOW()
    WHERE
    Id = ?
         ";

        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute(array(
                $model->OrderId,
                $model->ProductId,
                $model->CompanyId,
                $model->ProductName,
                $model->ProductType,
                $model->FeaturedImageUrl,
                $model->CustomerId,
                json_encode($model->Measurements),
                $model->Size,
                $model->Colour,
                $model->ColorCode,
                $UnitPrice,
                $model->Quantity,
                $SubTotal,
                $model->CreateUserId,
                $model->ModifyUserId,
                $model->StatusId,
                $model->Id


            ))) {
                return $this->getById($model->Id);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getById($Id)
    {
        $query = "SELECT * FROM orderproduct WHERE Id =?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($Id));

        if ($stmt->rowCount()) {
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            $item["Measurements"] = json_decode($item["Measurements"]);
            return  $item;
        }
    }
    public function getByOrderId($OrderId)
    {
        $query = "SELECT * FROM orderproduct WHERE OrderId =? AND StatusId = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($OrderId, 1));
        $results = array();
        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as $item) {
                $item["Measurements"] = json_decode($item["Measurements"]);
                array_push($results, $item);
            }
        }
        return $results;
    }


    public function delete($Id)
    {
        $query = "DELETE FROM orderproduct WHERE Id = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($Id));
            if ($stmt->rowCount()) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }
}
