<?php

class Images
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function GetAllByOtherId(
        $OtherId,
        $StatusId
    ) {
        # code...
        $query = "SELECT * FROM images WHERE OtherId =? AND StatusId = ? order by ModifyDate";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($OtherId, $StatusId));
        $all = array();
        if ($stmt->rowCount()) {
            $items =  $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as $item) {
                $item["Styles"] = json_decode($item["Styles"]);
                array_push($all, $item);
            }
            return $all;
        }
        return [];
    }


    public function Create(
        $model
    ) {
        # code...
        $query = "INSERT INTO images(
            ImageId, 
            OtherId, 
            OptionId, 
            Url, 
            Styles, 
            IsMain, 
            CreateUserId, 
            ModifyUserId, 
            StatusId
            ) 
            VALUES (?,?,?,?,?,?,?,?,?)
        ";
        $id =  getUuid($this->conn);
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute(array(
                $id,
                $model->OtherId,
                $model->OptionId,
                $model->Url,
                json_encode($model->Styles),
                $model->IsMain,
                $model->CreateUserId,
                $model->ModifyUserId,
                $model->StatusId
            ))) {
                return   $this->getById($id);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }




    public function SaveUploaded(
        $otherId,
        $userId,
        $url
    ) {
        # code...
        $query = "INSERT INTO images(
            ImageId, 
            OtherId, 
            OptionId, 
            Url, 
            Styles, 
            IsMain, 
            CreateUserId, 
            ModifyUserId, 
            StatusId
            ) 
            VALUES (?,?,?,?,?,?,?,?,?)
        ";
        $id =  getUuid($this->conn);
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute(array(
                $id,
                $otherId,
                '0',
                $url,
                '',
                '0',
                $userId,
                $userId,
                '1'
            ))) {
                return   $this->getById($id);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function Update(
        $model
    ) {
        # code...
        $query = "UPDATE images SET         
        OtherId= ?, 
        OptionId= ?, 
        Url= ?, 
        Styles= ?, 
        IsMain= ?, 
        CreateUserId= ?, 
        ModifyUserId= ?, 
        StatusId= ?,
        ModifyDate = NOW()
        WHERE ImageId = ?
        ";
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute(array(
                $model->OtherId,
                $model->OptionId,
                $model->Url,
                json_encode($model->Styles),
                $model->IsMain,
                $model->CreateUserId,
                $model->ModifyUserId,
                $model->StatusId,
                $model->ImageId
            ))) {
                return  $this->getById($model->ImageId, $model->StatusId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function getById(
        $ImageId
    ) {
        $query = "SELECT * FROM images WHERE ImageId =?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($ImageId));

        if ($stmt->rowCount()) {
            $item =  $stmt->fetch(PDO::FETCH_ASSOC);
            $item["Styles"] = json_decode($item["Styles"]);
            return $item;
        }
    }
}
