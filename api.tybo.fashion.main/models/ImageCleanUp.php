<?php

class ImageCleanUp
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }
    // private function getAllProducts()
    // {
    //     // String  array of all images
    //     $allImages = array();
    //     $query = "SELECT Images FROM  product Where 
    //      FeaturedImageUrl <> '' order by CreateDate Desc ";

    //     $stmt = $this->conn->prepare($query);
    //     $stmt->execute(array());

    //     if ($stmt->rowCount()) {
    //         $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    //         foreach ($items as $item) {
    //             $item["Images"] = json_decode($item["Images"]);
    //             foreach ($item["Images"] as $image) {
    //                 array_push($allImages, $image);
    //             }
    //         }
    //         return $allImages;
    //     }
    // }


    private function getAllProducts()
    {
        // String  array of all images
        $query = "SELECT ProductId,Images FROM  product Where 
         FeaturedImageUrl <> '' order by CreateDate Desc ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array());
        $results = array();

        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as $item) {
                $item["Images"] = json_decode($item["Images"]);
                //Images .length >0 add to results
                if ($item["Images"] && count($item["Images"]) > 0) {
                    array_push($results, $item);
                }
               
            }
            return $results;
        }
    }


    private  function checkImageUrls($imageUrls) {
        $notFoundUrls = [];
    
        foreach ($imageUrls as $url) {
            // Parse the URL to get the file path
            $parsedUrl = parse_url($url);
            $filePath = $_SERVER['DOCUMENT_ROOT'] . $parsedUrl['path'];
    
            // Check if the file exists on the server
            if (!file_exists($filePath)) {
                $notFoundUrls[] = $url;
            }
        }
    
        return $notFoundUrls;
    }
    public function go(){
        return $this->getAllProducts();
    }
}
