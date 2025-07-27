<?php
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
// header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
include_once '../../config/Database.php';
include_once '../../models/Images.php';
// $obj["POST"] = $_POST;
// $obj["FILE"] = $_FILES;
// echo  json_encode($obj);
// return;
$name = $_POST['name'];
if (isset($name)) {
    $target_dir = "uploads/";
    $fileName = $_FILES["file"]["name"];
    $fileExtention = explode('.', $fileName);
    $ext = strtolower(end($fileExtention));
    $target_file = $target_dir . $name;
    $moved = move_uploaded_file($_FILES["file"]["tmp_name"], $target_file);
    if ($moved) {
        // echo  json_encode($target_file);
        if (isset($_POST['Url'])) {

            $data = json_decode(file_get_contents("php://input"));

            $database = new Database();
            $db = $database->connect();

            $service = new Images($db);
            $url = $_POST['Url'] . $target_file;
            $result = $service->SaveUploaded($_POST['OtherId'], $_POST['UserId'], $url);
            echo json_encode($result);
        } else {
            echo  json_encode($target_file);
        }
    } else {
        echo json_encode('failed' . $_FILES["file"]["error"]);
    }
}
