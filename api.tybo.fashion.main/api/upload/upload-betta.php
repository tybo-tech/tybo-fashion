<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

include_once '../../config/Database.php';
include_once '../../models/Images.php';

$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$max_file_size = 10 * 1024 * 1024; // 10MB
$responses = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['files'])) {
        echo json_encode(['error' => 'No files uploaded.']);
        exit;
    }

    $files = $_FILES['files'];
    foreach ($files['name'] as $key => $name) {
        $fileSize = $files['size'][$key];
        $fileTmpName = $files['tmp_name'][$key];
        $fileError = $files['error'][$key];
        $fileExtension = pathinfo($name, PATHINFO_EXTENSION);
        $ext = strtolower($fileExtension);

        if ($fileError !== UPLOAD_ERR_OK) {
            if ($fileError === UPLOAD_ERR_INI_SIZE) {
                $ini_max_size = ini_get('upload_max_filesize');
                $responses[] = ['error' => "File size($fileSize) exceeds the maximum allowed size of $ini_max_size for file: $name"];
            } else {
                $responses[] = ['error' => "Error uploading file: $name. Error code: $fileError"];
            }
            continue;
        }

        if (!in_array($ext, $allowed_extensions)) {
            $responses[] = ['error' => "Invalid file type for file: $name"];
            continue;
        }

        if ($fileSize > $max_file_size) {
            $responses[] = ['error' => "File size exceeds limit for file: $name"];
            continue;
        }

        // Create a unique file name
        $uniqueId = uniqid('', true); // Generate a unique ID
        $safeName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($name, PATHINFO_FILENAME));
        $newFileName = $safeName . '_' . $uniqueId . '.' . $ext;

        $target_dir = "uploads-betta/";
        $target_file = $target_dir . $newFileName;

        if (move_uploaded_file($fileTmpName, $target_file)) {
            if (isset($_POST['Url'])) {
                $database = new Database();
                $db = $database->connect();
                $service = new Images($db);

                $url = $_POST['Url'] . $target_file;
                $result = $service->SaveUploaded($_POST['OtherId'], $_POST['UserId'], $url);
                $responses[] = ['success' => $result];
            } else {
                $responses[] = ['success' => $target_file];
            }
        } else {
            $responses[] = ['error' => "Failed to move uploaded file: $name"];
        }
    }

    echo json_encode($responses);
}
?>