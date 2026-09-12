<?php
require_once __DIR__ . '/../common/Cast.php';

/**
 * Pure, DB-free logic for the marketplace homepage product feed.
 *
 * The homepage is the first impression for shoppers, so it must only ever
 * surface listings a shopper can actually buy:
 *
 *   - ShowOnline is truthy
 *   - StatusId = 1 (not deleted/draft)
 *   - FeaturedImageUrl is non-empty
 *   - RegularPrice is a positive number
 *   - Name is non-empty
 *   - the owning shop exists, is active (StatusId = 1) and not deleted
 *
 * On top of eligibility it also normalises the messy legacy columns
 * (StockType vs IsJustInTime), decodes JSON columns that are sometimes
 * stored as the literal string "null", computes the platform's 50% deposit,
 * and diversifies the feed so one shop cannot dominate the first row of
 * cards with visually identical pieces.
 *
 * Kept static and dependency-free (like JobTotals/Cast) so the rules can be
 * unit-tested without a database.
 */
class HomeFeed
{
    public const DEFAULT_PER_SHOP_CAP = 2;
    public const DEFAULT_MIN_RESULTS = 6;

    /**
     * A single product+shop row is eligible for the homepage feed.
     *
     * Expects a flat row from the product/company join (shop fields are
     * aliased ShopName, ShopSlug, ShopLogo, ShopCity, ShopStatusId,
     * ShopIsDeleted).
     */
    public static function isEligible(array $row): bool
    {
        if (empty($row['Id']) && empty($row['ProductId'])) {
            return false;
        }
        if (trim((string) ($row['Name'] ?? '')) === '') {
            return false;
        }
        if (trim((string) ($row['FeaturedImageUrl'] ?? '')) === '') {
            return false;
        }
        if (!self::isTruthy($row['ShowOnline'] ?? null)) {
            return false;
        }
        if ((int) ($row['StatusId'] ?? 0) !== 1) {
            return false;
        }
        if (Cast::moneyFloat($row['RegularPrice'] ?? null) <= 0) {
            return false;
        }
        if (empty($row['CompanyId'])) {
            return false;
        }
        if ((int) ($row['ShopStatusId'] ?? 0) !== 1) {
            return false;
        }
        if (self::isTruthy($row['ShopIsDeleted'] ?? null)) {
            return false;
        }
        return true;
    }

    /**
     * Canonical shopper-facing stock label: "Ready to wear" or
     * "Made to order". StockType ('Stock product'|'Made To Order') and
     * IsJustInTime ('Ready to wear'|'Custom') are two halves of the same
     * question, so when they disagree we trust the made-to-order/custom
     * signal: a shopper can always be told "made to order", never the
     * reverse. Returns '' when neither column carries a usable value.
     */
    public static function stockLabel($stockType, $isJustInTime): string
    {
        $labels = [];
        foreach ([$stockType, $isJustInTime] as $value) {
            $label = self::matchStockLabel($value);
            if ($label !== '') {
                $labels[] = $label;
            }
        }
        if (in_array('Made to order', $labels, true)) {
            return 'Made to order';
        }
        return $labels ? 'Ready to wear' : '';
    }

    /**
     * Normalise a single eligible row for the API response: numeric money,
     * decoded JSON, a 50% deposit, a stock label and designer details.
     */
    public static function normalizeRow(array $row): array
    {
        $price = Cast::moneyFloat($row['RegularPrice'] ?? null);
        $row['RegularPrice'] = $price;
        $row['Deposit'] = round($price * 0.5, 2);

        if (array_key_exists('OldPrice', $row) && $row['OldPrice'] !== null) {
            $row['OldPrice'] = Cast::moneyFloat($row['OldPrice']);
        }

        $row['Images'] = self::decodeImages($row['Images'] ?? null);
        $row['Metadata'] = self::decodeJson($row['Metadata'] ?? null);
        $row['StockLabel'] = self::stockLabel(
            $row['StockType'] ?? null,
            $row['IsJustInTime'] ?? null
        );

        $row['Designer'] = [
            'Name' => trim((string) ($row['ShopName'] ?? '')),
            'Slug' => trim((string) ($row['ShopSlug'] ?? '')),
            'Logo' => trim((string) ($row['ShopLogo'] ?? '')),
            'City' => trim((string) ($row['ShopCity'] ?? '')),
        ];

        unset(
            $row['ShopName'],
            $row['ShopSlug'],
            $row['ShopLogo'],
            $row['ShopCity'],
            $row['ShopStatusId'],
            $row['ShopIsDeleted']
        );

        return $row;
    }

    /**
     * Pick up to $target rows, capping each shop at $perShopCap while
     * deduping by product id, shop+name and image. A second pass relaxes the
     * shop cap so a small catalogue still fills the row.
     */
    public static function diversify(array $rows, int $target, int $perShopCap): array
    {
        if ($target <= 0) {
            return [];
        }
        if ($perShopCap <= 0) {
            $perShopCap = self::DEFAULT_PER_SHOP_CAP;
        }

        $selected = [];
        $chosenIds = [];
        $perShop = [];
        $nameKeys = [];
        $images = [];

        $take = function (array $row, bool $respectCap) use (
            &$selected,
            &$chosenIds,
            &$perShop,
            &$nameKeys,
            &$images,
            $target,
            $perShopCap
        ): bool {
            if (count($selected) >= $target) {
                return false;
            }
            $id = (string) ($row['Id'] ?? $row['ProductId'] ?? '');
            if ($id !== '' && isset($chosenIds[$id])) {
                return false;
            }
            $shop = (string) ($row['CompanyId'] ?? '');
            if ($respectCap && ($perShop[$shop] ?? 0) >= $perShopCap) {
                return false;
            }
            $nameKey = $shop . '|' . strtolower(trim((string) ($row['Name'] ?? '')));
            if (isset($nameKeys[$nameKey])) {
                return false;
            }
            $image = trim((string) ($row['FeaturedImageUrl'] ?? ''));
            if ($image !== '' && isset($images[$image])) {
                return false;
            }

            $selected[] = $row;
            if ($id !== '') {
                $chosenIds[$id] = true;
            }
            $perShop[$shop] = ($perShop[$shop] ?? 0) + 1;
            $nameKeys[$nameKey] = true;
            if ($image !== '') {
                $images[$image] = true;
            }
            return true;
        };

        foreach ($rows as $row) {
            $take($row, true);
        }
        if (count($selected) < $target) {
            foreach ($rows as $row) {
                $take($row, false);
            }
        }

        return $selected;
    }

    /**
     * Merge a primary feed with an optional curated fallback, drop anything
     * ineligible, diversify to $target and normalise the survivors.
     */
    public static function build(
        array $primary,
        array $fallback,
        int $target,
        int $perShopCap = self::DEFAULT_PER_SHOP_CAP
    ): array {
        $merged = [];
        $seen = [];

        foreach (array_merge(array_values($primary), array_values($fallback)) as $row) {
            if (!self::isEligible($row)) {
                continue;
            }
            $id = (string) ($row['Id'] ?? $row['ProductId'] ?? '');
            if ($id !== '' && isset($seen[$id])) {
                continue;
            }
            if ($id !== '') {
                $seen[$id] = true;
            }
            $merged[] = $row;
        }

        $selected = self::diversify($merged, $target, $perShopCap);

        return array_map([self::class, 'normalizeRow'], $selected);
    }

    private static function matchStockLabel($value): string
    {
        $normalized = strtolower(trim((string) $value));
        if ($normalized === '') {
            return '';
        }
        if (
            str_contains($normalized, 'make')
            || str_contains($normalized, 'custom')
            || str_contains($normalized, 'order')
        ) {
            return 'Made to order';
        }
        if (
            str_contains($normalized, 'stock')
            || str_contains($normalized, 'ready')
        ) {
            return 'Ready to wear';
        }
        return '';
    }

    private static function decodeImages($value): array
    {
        if (is_array($value)) {
            return array_values(array_filter($value, 'is_string'));
        }
        $decoded = self::decodeJson($value);
        if (!is_array($decoded)) {
            return [];
        }
        return array_values(array_filter($decoded, 'is_string'));
    }

    private static function decodeJson($value)
    {
        if (is_array($value) || is_object($value)) {
            return $value;
        }
        if (!is_string($value)) {
            return null;
        }
        $trimmed = trim($value);
        if ($trimmed === '' || strtolower($trimmed) === 'null') {
            return null;
        }
        $decoded = json_decode($trimmed, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }

    private static function isTruthy($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_numeric($value)) {
            return (float) $value != 0.0;
        }
        $normalized = strtolower(trim((string) $value));
        return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
    }
}
