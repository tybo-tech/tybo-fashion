<?php

class CollectionQuery
{
    private $conn;
    private array $collection = [];
    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function collection($name, $companyId, $type = '')
    {
        $parsedCompanyId = $this->slugToId($companyId);
        $key = 'Categories';
        if ($type == 'Collections') {
            $key = 'Collections';
        }
        $products = array();
        require_once 'Other_info.php';
        $otherInfo = new Other_info($this->conn);
        $collection = $otherInfo->getByName($name, $parsedCompanyId, $key);
        if (!$collection) {
            return array();
        }
        $this->collection = $collection;
        $allProducts = $this->GetProducts($parsedCompanyId);
        foreach ($allProducts as $item) {

            //e.g $item["Categories"] = json_decode($item["Categories"]);
            if ($item[$key] && in_array($name, $item[$key])) {
                array_push($products, $item);
            }
        }
        return count($products) > 0 ?
            $this->GetDetailedProductList($products) : array();
    }

    public function GetProducts($CompanyId)
    {
        $select = "SELECT Id,ProductId, Categories, Collections FROM  product";
        $orderBy = " order by CreateDate Desc ";
        if (!empty($CompanyId)) {
            $select .= " Where CompanyId = '$CompanyId'";
            $select .= " and FeaturedImageUrl <> ''";
            $select .= " and ShowOnline = 1";
        } else {
            $select .= " Where FeaturedImageUrl <> ''";
            $select .= " and ShowOnline = 1";
        }
        $query = $select . $orderBy;


        $stmt = $this->conn->prepare($query);
        $stmt->execute(array());

        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $results = array();
            foreach ($items as $item) {
                $item["Categories"] = json_decode($item["Categories"]);
                $item["Collections"] = json_decode($item["Collections"]);
                // Push ony if $item["Categories"] is not empty
                if (!empty($item["Categories"]) || !empty($item["Collections"]))
                    array_push($results, $item);
            }
            return $results;
        }
    }

    public function GetDetailedProductList($products)
    {
        $query = "select 
        Id,Slug,Name,ProductId, FeaturedImageUrl, RegularPrice, CompanyId
        from product where Id in (";
        $inQuery = '';
        $params = array();
        foreach ($products as $product) {
            $inQuery .= '?,';
            $params[] = $product['Id'];
        }
        $inQuery = rtrim($inQuery, ',');
        $query .= $inQuery . ')';
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            require_once 'DiscountManager.php';
            $service = new DiscountManager($this->conn, $this->collection["Id"].'');
            return $service->applyDiscountsToProducts($items);
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

}
