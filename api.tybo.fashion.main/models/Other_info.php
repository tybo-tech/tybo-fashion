<?php
require_once 'OccasionCatalog.php';

class Other_info
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function Add($model)
    {
        $query = "INSERT INTO other_info(
                    Name,
                    ItemType,
                    ImageUrl,
                    ParentId,
                    Notes,
                    ItemValue,
                    Status,
                    Decription,
                    Rules,
                    ItemCode
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute([
                $model->Name,
                $model->ItemType,
                $model->ImageUrl,
                $model->ParentId,
                $model->Notes,
                json_encode($this->normalizeItemValue($model)),
                $model->Status,
                $model->Decription,
                $model->Rules,
                $model->ItemCode
            ])) {
                $Id = $this->conn->lastInsertId();
                return $this->getById($Id);
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function Update($model)
    {
        $query = "UPDATE other_info SET
                    Name = ?,
                    ItemType = ?,
                    ImageUrl = ?,
                    ParentId = ?,
                    Notes = ?,
                    ItemValue = ?,
                    Status = ?,
                    Decription = ?,
                    Rules = ?,
                    ItemCode = ?
                  WHERE Id = ?";
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute([
                $model->Name,
                $model->ItemType,
                $model->ImageUrl,
                $model->ParentId,
                $model->Notes,
                json_encode($this->normalizeItemValue($model)),
                $model->Status,
                $model->Decription,
                $model->Rules,
                $model->ItemCode,
                $model->Id
            ])) {
                return $this->getById($model->Id);
            }
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function getById($Id)
    {
        $query = "SELECT * FROM other_info WHERE Id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$Id]);

        if ($stmt->rowCount()) {
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            $item["ItemValue"] = json_decode($item["ItemValue"]);
            return $item;
        }
    }

    public function getByName($Name, $ParentId, $ItemType)
    {
        $query = "SELECT * FROM other_info WHERE Name = ? AND ParentId = ? AND ItemType = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$Name, $ParentId, $ItemType]);

        if ($stmt->rowCount()) {
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            $item["ItemValue"] = json_decode($item["ItemValue"]);
            return $item;
        }
    }

    public function delete($Id)
    {
        $query = "DELETE FROM other_info WHERE Id = ?";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$Id]);
            return ["deleted" => $stmt->rowCount() > 0];
        } catch (Exception $e) {
            return ["ERROR", $e];
        }
    }

    public function search($ParentId, $ItemType)
    {
        $query = "SELECT * FROM other_info WHERE ParentId = ? AND ItemType = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$ParentId, $ItemType]);

        if ($stmt->rowCount()) {
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as &$item) {
                $item["ItemValue"] = json_decode($item["ItemValue"]);
            }
            return $items;
        }
        return [];
    }

    /**
     * All active WorkGallery items across every active, non-deleted designer.
     *
     * Powers the cross-designer "shop by occasion" experience. Each item is
     * joined with its designer (name/slug/logo/city) so the frontend can show
     * who made a piece without a second request.
     */
    public function allWorkGallery($limit = 300)
    {
        $limit = (int) $limit;
        if ($limit <= 0) {
            $limit = 300;
        }

        $query = "SELECT
                    o.Id,
                    o.Name,
                    o.ItemType,
                    o.ImageUrl,
                    o.ParentId,
                    o.Decription,
                    o.ItemValue,
                    o.CreateDate,
                    c.Name AS CompanyName,
                    c.Slug AS CompanySlug,
                    c.Dp AS CompanyLogo,
                    c.City AS CompanyCity
                  FROM other_info o
                  INNER JOIN company c ON c.CompanyId = o.ParentId
                  WHERE o.ItemType = 'WorkGallery'
                    AND o.Status = 'Active'
                    AND c.StatusId = 1
                    AND c.IsDeleted = 0
                  ORDER BY o.CreateDate DESC
                  LIMIT $limit";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['ItemValue'] = json_decode($item['ItemValue'], true);
            $item['Company'] = [
                'Name' => $item['CompanyName'],
                'Slug' => $item['CompanySlug'],
                'Logo' => $item['CompanyLogo'],
                'City' => $item['CompanyCity'],
            ];
            unset($item['CompanyName'], $item['CompanySlug'], $item['CompanyLogo'], $item['CompanyCity']);
        }

        return $items;
    }

    /**
     * WorkGallery items for one occasion, across designers, plus the occasion
     * meta. Returns null when the slug is not a known occasion.
     */
    public function occasionGallery(string $slug, int $limit = 60)
    {
        $occasion = OccasionCatalog::findBySlug($slug);
        if (!$occasion) {
            return null;
        }

        $items = $this->allWorkGallery(600);
        $grouped = OccasionCatalog::groupByOccasion($items);
        $matched = $grouped[$occasion['Slug']] ?? [];

        return [
            'Occasion' => [
                'Name' => $occasion['Name'],
                'Slug' => $occasion['Slug'],
            ],
            'Items' => array_slice($matched, 0, $limit),
        ];
    }

    /**
     * The occasion index: only occasions that actually have live pieces are
     * returned, each with a cover image (and count) so the frontend never
     * renders an empty tile.
     */
    public function occasionIndex()
    {
        $items = $this->allWorkGallery(600);
        $grouped = OccasionCatalog::groupByOccasion($items);

        $result = [];
        foreach (OccasionCatalog::OCCASIONS as $occasion) {
            $matches = $grouped[$occasion['Slug']] ?? [];
            if (!$matches) {
                continue;
            }
            $cover = $matches[0]['ImageUrl']
                ?? ($matches[0]['ItemValue']['coverImage'] ?? '');
            $result[] = [
                'Name' => $occasion['Name'],
                'Slug' => $occasion['Slug'],
                'ImageUrl' => $cover,
                'Count' => count($matches),
            ];
        }
        return $result;
    }

    /**
     * Audit fix §7.12 — the size library (ItemType 'SystemSizes') is a
     * single shared string array, so writes are normalised server-side:
     * labels are trimmed and duplicates are removed case-insensitively
     * (first occurrence wins). Other ItemTypes store object payloads and
     * are passed through untouched.
     */
    private function normalizeItemValue($model)
    {
        $value = $model->ItemValue ?? null;
        $itemType = isset($model->ItemType) ? (string) $model->ItemType : '';
        if ($itemType !== 'SystemSizes' || !is_array($value)) {
            return $value;
        }

        $seen = array();
        $normalised = array();
        foreach ($value as $label) {
            if (!is_string($label)) {
                $normalised[] = $label;
                continue;
            }
            $trimmed = trim($label);
            if ($trimmed === '') {
                continue;
            }
            $key = strtolower($trimmed);
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $normalised[] = $trimmed;
        }
        return $normalised;
    }

}