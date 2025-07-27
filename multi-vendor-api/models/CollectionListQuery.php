<?php

class CollectionListQuery
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }
    public function collections($companyId, $type = '')
    {
        $parsedCompanyId = $this->slugToId($companyId);
        error_log($parsedCompanyId . ' ' . $type . ' CollectionListQuery');

        $query = "SELECT 
        Name,ImageUrl,Id
         FROM other_info 
        WHERE 
        ParentId = ? and  ItemType= ? and ImageUrl <> ''";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($parsedCompanyId, $type));
        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->formatData($parsedCompanyId, $items,$type);
        }
        return [];
    }

    public function allCollections($type = '')
    {

        $query = "SELECT 
        Name,ImageUrl,Id
         FROM other_info 
        WHERE 
        ItemType= ? and ImageUrl <> ''";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($type));
        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->formatData('', $items, $type);
        }
    }
    private function formatData($companyId, $items, $type)
    {
        $key = 'Categories';
        if ($type == 'Collections') {
            $key = 'Collections';
        }
        $products = !empty($companyId) ? $this->GetProducts($companyId) : $this->GetAllProducts();
        $results = array();
        foreach ($items as $item) {
            $count = $this->FilterProducts($products, $item["Name"], $key);
            $item["CountProducts"] = $count;
            if ($count > 0)
                array_push($results, $item);
        }
        return $results;
    }
    public function FilterProducts($Products, $Category, $key)
    {

        $count = 0;
        foreach ($Products as $item) {
            if ($item[$key] && in_array($Category, $item[$key])) {
                $count += 1;
            }
        }
        return $count;
    }
    public function GetProducts($CompanyId)
    {
        $query = "SELECT Categories, Collections
         FROM  product Where 
        CompanyId = ? 
        and FeaturedImageUrl <> '' 
        and ShowOnline = 1
        order by CreateDate Desc ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($CompanyId));

        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $results = array();
            foreach ($items as $item) {
                $item["Categories"] = json_decode($item["Categories"]);
                $item["Collections"] = json_decode($item["Collections"]);
                array_push($results, $item);
            }
            return $results;
        }
    }
    public function slugToId($slug)
    {
        $query = "SELECT CompanyId FROM  company Where CompanyId = ? or Slug = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array($slug, $slug));

        if ($stmt->rowCount()) {
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            return $item['CompanyId'] ?? '';
        }
    }
    public function GetAllProducts()
    {
        $query = "SELECT Id, Categories
         Collections
         FROM  product Where 
         FeaturedImageUrl <> '' 
        and ShowOnline = 1
         order by CreateDate Desc ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute(array());

        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $results = array();
            foreach ($items as $item) {
                $item["Categories"] = json_decode($item["Categories"]);
                $item["Collections"] = json_decode($item["Collections"]);
                array_push($results, $item);
            }
            return $results;
        }
    }

}
