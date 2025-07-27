<?php
include_once 'headers.php';

class Database
{
    private $isLocal = false;
    public function connect()
    {
        $conn = null;
        try {
            if ($this->isLocal) {
                $conn = new PDO('mysql:host=localhost;dbname=tyboaccounting', 'root', '');
            } else {
                // $conn = new PDO('mysql:host=127.0.0.1;dbname=lpullgrw_tybofashion', 'lpullgrw_tybofashion', 'Harder01!');
                $conn = new PDO('mysql:host=localhost:3306;dbname=tybofash_main', 'tybofash_main', 'Tybo4Fashion!');

            }

            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo json_encode($e->getMessage());
        }
        return $conn;
    }
}
 