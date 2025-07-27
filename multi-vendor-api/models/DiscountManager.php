<?php
class DiscountManager
{
    public function applyDiscountsToProducts(array $products, ?array $discount = null): array
    {
        $discounted = [];

        foreach ($products as $product) {
            $discounted[] = $discount
                ? $this->applyDiscount($product, $discount)
                : $product;
        }

        return $discounted;
    }

    public function applyDiscountToProduct(array $product, ?array $discount = null): array
    {
        return $discount
            ? $this->applyDiscount($product, $discount)
            : $product;
    }

    private function applyDiscount(array $product, array $discount): array
    {
        $original = (float) $product['RegularPrice'];
        $value = (float) $discount['DiscountValue'];
        $discounted = $original;

        switch (strtolower($discount['DiscountValueType'])) {
            case 'percentage':
                $discounted = $original - ($value / 100 * $original);
                break;
            case 'amount':
                $discounted = $original - $value;
                break;
        }

        if ($discounted < 0) {
            $discounted = 0;
        }

        $product['OldPrice'] = $original;
        $product['RegularPrice'] = number_format($discounted, 2, '.', '');
        $product['AppliedDiscountId'] = $discount['Id'];

        return $product;
    }
}
