<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
$data = json_decode(file_get_contents("php://input"));
if (isset($data)) {

    $FromEmail = $data->FromEmail;
    $ToEmail = $data->ToEmail;
    $Subject = $data->Subject;
    $Message = $data->Message;

 

    $msg = '<body style="font-family: Calibri;">' . $Message . '</body>';
    $headers  = 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

    $headers .= 'From: ' . $FromEmail . "\r\n" .
        'Reply-To: ' . $FromEmail . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    if (isset($ToEmail)) {
        if (mail($ToEmail, $Subject, $msg, $headers)) {
            echo 1;
        } else {
            echo 0;
        }
    } else {
        echo 3;
    }
}
