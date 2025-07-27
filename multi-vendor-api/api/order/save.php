<?php
include_once '../../config/Database.php';
include_once '../../models/Orders.php';
include_once '../../models/Orderproduct.php';
include_once '../../models/User.php';
include_once '../../models/Customer.php';

$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->connect();

$service = new Orders($db);
$orderproductService = new Orderproduct($db);
if (!empty($data->CreateDate))
    $result = $service->Update($data);
else $result = $service->Create($data);

if ($result['OrdersId'] && $data->Orderproducts && count($data->Orderproducts) > 0) {
    foreach ($data->Orderproducts as $item) {
        if ($item->StatusId == 99) {
            $added = $orderproductService->delete($item->Id);
        } else {
            if (!empty($item->CreateDate))
                $added = $orderproductService->Update($item);
            else  $added = $orderproductService->add($item, $result['OrdersId']);
        }
    }
}

if ($result['OrdersId'] && isset($data->CustomerToCreate)) {
    $customerService = new Customer($db);
    $saveCustomer = $customerService->add($data->CustomerToCreate);
    $service->UpdateCustomerId($saveCustomer['CustomerId'], $result['OrdersId']);
}
if ($result['OrdersId'] && isset($data->UserToCreate)) {
    $userService = new User($db);
    $newUser = $userService->add($data->UserToCreate);
    $service->UpdateUserIdId($newUser['UserId'], $result['OrdersId']);
}
$final = $service->getDetailedOrder($result['OrdersId']);
echo json_encode($final);
