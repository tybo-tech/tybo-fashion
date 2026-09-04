<?php
require_once 'Company.php';
require_once 'Orderproduct.php';
require_once 'Customer.php';

class Orders
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }
    public function Create(
        $model
    ) {
        $Id = getUuid($this->conn);
        $query = "INSERT INTO orders
        (
            OrdersId,
            OrderNo,
            CompanyId,
            CustomerId,
            AddressId,
            Notes,
            OrderType,
            Total,
            Paid,
            Due,
            Shipping,
            ShippingPrice,
            UserId,
            InvoiceDate,
            DueDate,
            EstimatedDeliveryDate,
            CartCout,
            ItemsTotal,
            JobId,
            PaymentMethod,
            PaymentStatus,
            PaymentType,
            OrderSource,
            CreateUserId,
            ModifyUserId,
            Status,
            FulfillmentStatus,
            Metadata,
            StatusId
        ) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ";
        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(array(
                    $Id,
                    $model->OrderNo,
                    $model->CompanyId,
                    $model->CustomerId,
                    $model->AddressId,
                    $model->Notes,
                    $model->OrderType,
                    $model->Total,
                    $model->Paid,
                    $model->Due,
                    $model->Shipping,
                    $model->ShippingPrice,
                    $model->UserId,
                    $model->InvoiceDate,
                    $model->DueDate,
                    $model->EstimatedDeliveryDate,
                    $model->CartCout,
                    $model->ItemsTotal,
                    $model->JobId,
                    $model->PaymentMethod,
                    $model->PaymentStatus,
                    $model->PaymentType,
                    $model->OrderSource,
                    $model->CreateUserId,
                    $model->ModifyUserId,
                    $model->Status,
                    $model->FulfillmentStatus,
                    json_encode($model->Metadata),
                    $model->StatusId
                ))
            ) {
                return $this->GetById($Id);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function GetById(
        $OrdersId
    ) {
        # code...
        $query = "SELECT * FROM orders WHERE OrdersId = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($OrdersId));

            if ($stmt->rowCount()) {
                $order = $stmt->fetch(PDO::FETCH_ASSOC);
                $order["Metadata"] = json_decode($order["Metadata"]);
                return $order;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function List()
    {
        # code...
        $query = "SELECT * FROM orders";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array());

            if ($stmt->rowCount()) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function getDetailedOrder(
        $OrdersId
    ) {
        # code...
        $query = "SELECT * FROM orders WHERE OrdersId = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($OrdersId));
            // $user = new User($this->conn);
            $user = new Customer($this->conn);
            $orderproduct = new Orderproduct($this->conn);
            $company = new Company($this->conn);
            if ($stmt->rowCount()) {
                $order = $stmt->fetch(PDO::FETCH_ASSOC);
                $order['Customer'] = $user->getUserById($order['CustomerId']);
                $order['Orderproducts'] = $orderproduct->getByOrderId($order['OrdersId']);
                $order['Company'] = $company->GetById($order['CompanyId'], 0, 1);
                $order["Metadata"] = json_decode($order["Metadata"]);
                $order['CountOrders'] = $this->CountCompanyOrders($order['CompanyId']);

                return $order;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function Update(
        $model
    ) {
        # code...
        $query = "UPDATE orders SET        
        OrderNo = ?,
        CompanyId = ?,
        CustomerId = ?,
        AddressId = ?,
        Notes = ?,
        OrderType = ?,
        Total = ?,
        Paid = ?,
        Due = ?,
        Shipping = ?,
        ShippingPrice = ?,
        UserId = ?,
        InvoiceDate = ?,
        DueDate = ?,
        EstimatedDeliveryDate = ?,
        CartCout = ?,
        ItemsTotal = ?,
        JobId = ?,
        PaymentMethod = ?,
        PaymentStatus = ?,
        PaymentType = ?,
        OrderSource = ?,
        ModifyUserId = ?,
        Status = ?,
        FulfillmentStatus = ?,
        Metadata = ?,
        StatusId = ?,
        ModifyDate = now()
        WHERE OrdersId = ?      
        ";
        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(array(
                    $model->OrderNo,
                    $model->CompanyId,
                    $model->CustomerId,
                    $model->AddressId,
                    $model->Notes,
                    $model->OrderType,
                    $model->Total,
                    $model->Paid,
                    $model->Due,
                    $model->Shipping,
                    $model->ShippingPrice,
                    $model->UserId,
                    $model->InvoiceDate,
                    $model->DueDate,
                    $model->EstimatedDeliveryDate,
                    $model->CartCout,
                    $model->ItemsTotal,
                    $model->JobId,
                    $model->PaymentMethod,
                    $model->PaymentStatus,
                    $model->PaymentType,
                    $model->OrderSource,
                    $model->ModifyUserId,
                    $model->Status,
                    $model->FulfillmentStatus,
                    json_encode($model->Metadata),
                    $model->StatusId,
                    $model->OrdersId
                ))
            ) {
                return $this->GetById($model->OrdersId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function UpdateCustomerId(
        $CustomerId,
        $OrdersId
    ) {
        # code...
        $query = "UPDATE orders SET        
        CustomerId = ?,
        ModifyDate = now()
        WHERE OrdersId = ?      
        ";
        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(array(
                    $CustomerId,
                    $OrdersId
                ))
            ) {
                return $this->GetById($OrdersId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }


    public function UpdateUserIdId(
        $UserId,
        $OrdersId
    ) {
        # code...
        $query = "UPDATE orders SET        
        UserId = ?,
        ModifyDate = now()
        WHERE OrdersId = ?      
        ";
        try {
            //code...
            $stmt = $this->conn->prepare($query);
            if (
                $stmt->execute(array(
                    $UserId,
                    $OrdersId
                ))
            ) {
                return $this->GetById($OrdersId);
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }
    public function getByJobId(
        $JobId
    ) {

        $query = "SELECT * FROM orders WHERE JobId = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($JobId));
            // $user = new User($this->conn);
            $user = new Customer($this->conn);
            $orderproduct = new Orderproduct($this->conn);
            $company = new Company($this->conn);
            if ($stmt->rowCount()) {
                $order = $stmt->fetch(PDO::FETCH_ASSOC);
                $order['Customer'] = $user->getUserById($order['CustomerId']);
                $order['Orderproducts'] = $orderproduct->getByOrderId($order['OrdersId']);
                $order['Company'] = $company->GetById($order['CompanyId'], 0, 1);
                //   $order['CountOrders'] = $this->CountCompanyOrders($order['CompanyId']);

                return $order;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function CountCompanyOrders($CompanyId)
    {

        $query = "SELECT count(OrdersId) as Count FROM orders WHERE CompanyId = ?";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($CompanyId));
            $orders = $stmt->fetch(PDO::FETCH_ASSOC);
            return $orders['Count'];
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }
    public function GetByCompanyId($CompanyId, $StatusId)
    {
        # code...
        $query = "SELECT * FROM orders WHERE CompanyId = ? AND Status = ? ORDER BY ModifyDate DESC";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($CompanyId, $StatusId));
            $user = new Customer($this->conn);
            $orderproduct = new Orderproduct($this->conn);
            $results = array();
            if ($stmt->rowCount()) {
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($orders as $order) {
                    $order['Customer'] = $user->getUserById($order['CustomerId']);
                    $order['Orderproducts'] = $orderproduct->getByOrderId($order['OrdersId']);
                    $order["Metadata"] = json_decode($order["Metadata"]);

                    array_push($results, $order);
                }
                return $results;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }

    public function GetByUserId($UserId)
    {
        # code...
        $query = "SELECT * FROM orders WHERE UserId = ? ORDER BY ModifyDate DESC";

        try {
            //code...
            $stmt = $this->conn->prepare($query);
            $stmt->execute(array($UserId));
            $user = new Customer($this->conn);
            $orderproduct = new Orderproduct($this->conn);
            $results = array();
            if ($stmt->rowCount()) {
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($orders as $order) {
                    $order['Customer'] = $user->getUserById($order['CustomerId']);
                    $order['Orderproducts'] = $orderproduct->getByOrderId($order['OrdersId']);
                    $order["Metadata"] = json_decode($order["Metadata"]);
                    array_push($results, $order);
                }
                return $results;
            }
        } catch (Exception $e) {
            return array("ERROR", $e);
        }
    }
}
