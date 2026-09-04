<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

$fileName = $_GET['file'];
if (!empty($fileName)) {
    $path = explode('upload/uploads', $fileName);
     $ext = "uploads" . end($path);
    if (unlink($ext)) {
        $data['Status'] = 'Ok';
    } else {
        $data['Status'] = 'Error';
    }
    echo json_encode($data);
}
