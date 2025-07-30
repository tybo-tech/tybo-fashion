<?php
include_once 'headers.php';
include_once '../../common/common.php';

class Database
{
  private $isLocal = false;
  public function connect()
  {
    $conn = null;
    try {
      if ($this->isLocal) {
        $conn = new PDO('mysql:host=localhost;dbname=tybocoza_editor', 'root', '');
      } else {
        $conn = new PDO('mysql:host=mysql;dbname=docker', 'docker', 'docker');
        // $conn = new PDO('mysql:host=localhost:3306;dbname=tybofash_main', 'tybofash_main', 'Tybo4Fashion!');
      }

      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
      echo json_encode($e->getMessage());
    }
    return $conn;
  }
  public function getGuid($conn)
  {
    $stmt = $conn->prepare("SELECT uuid() as ID from dual");
    $stmt->execute(array());

    if ($stmt->rowCount()) {
      $uuid = $stmt->fetch(PDO::FETCH_ASSOC);
      return $uuid['ID'];
    }
  }
}

function cleanUtf8Array($arr)
{
  return array_map(function ($item) {
    return is_array($item)
      ? cleanUtf8Array($item)
      : (is_string($item) ? mb_convert_encoding($item, 'UTF-8', 'UTF-8') : $item);
  }, $arr);
}


function logData($message)
{
  error_log("-----------------------------------------------------");
  error_log("-----------------------------------------------------");
  error_log("-----------------------------------------------------");
  error_log("-----------------------------------------------------");
  error_log("-----------------------------------------------------");
  error_log($message);
  error_log("-----------------------------------------------------");
  error_log("-----------------------------------------------------");
  error_log("-----------------------------------------------------");
  error_log("-----------------------------------------------------");
  error_log("-----------------------------------------------------");
}
