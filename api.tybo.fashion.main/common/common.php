<?php

 function  getUuid($conn){
    $stmt = $conn->prepare("SELECT uuid() as Id from dual");
    $stmt->execute(array());

    if ($stmt->rowCount()) {
        $uuid = $stmt->fetch(PDO::FETCH_ASSOC);
        return  $uuid['Id'];
    }
    }

 function  slugify($value){
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/[^a-z0-9\s-]/', '', $value);
    $value = preg_replace('/[\s-]+/', '-', $value);
    return trim($value, '-');
    }