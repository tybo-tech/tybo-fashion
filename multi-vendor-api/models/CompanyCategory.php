<?php

class CompanyCategory
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getCategoriesByCompanyAndParent($companyId,$isAdmin, $parentId = null)
    {
        require_once 'Company.php';

        $companyService = new Company($this->conn);
        $company = $companyService->simple($companyId);
        if (!$company)
            return [];

        // ✅ Load Categories dependency only if company exists
        require_once 'Categories.php';
        $categoryService = new Categories($this->conn);
        // ✅ Load category if parentId is not null
        if ($parentId) {
            $company["Category"] = $categoryService->getById($parentId);
            // ✅ Load category tree
            $company["Categories"] = $categoryService->getHierarchyWithCounts(
                $companyId,
                false,
                10000,
                $isAdmin === 'yes'
            );

            return $company;
        }
        // ✅ Load category tree
        $company["Categories"] = $categoryService->getHierarchyWithCounts(
            $companyId,
            false,
            10000,
            $isAdmin === 'yes'
        );

        return $company;
    }
}
