<?php

/**
 * Sprint 5 §6 — locked financial formula, server-side source of truth.
 *
 * Mirrors the client cart_total/applyDiscount/calculatePaidAmount logic in
 * src/services/job.service.ts, but is authoritative for the transactional
 * endpoints. Pure/static and DB-free so the formula is unit-testable.
 *
 * Formula (normative, from sprints/5-job-hierarchy-overview-plain-garment-list-garment-details.md):
 *   item.SubTotal = UnitPrice × Quantity
 *   Percentage discount applies to garments only
 *   Shipping is added after the garment discount
 *   paidAmount = sum of Metadata.payments
 *   dueAmount  = TotalCost − paidAmount (may be negative when overpaid)
 *
 * Last-garment removal must NOT reproduce the client delete_from_cart()
 * behaviour (which replaces almost all metadata and forces TotalCost = 0).
 * It must preserve invoice, payments, proof and unrelated metadata,
 * remove/reset garment-discount fields appropriately, preserve shipping,
 * and set the total to the remaining shipping charge — which falls out of
 * the same formula with an empty item list.
 */
class JobTotals
{
    /**
     * @param array $items Rows from jobitem (UnitPrice, Quantity columns).
     * @param array $metadata Decoded job.Metadata (assoc array).
     * @param mixed $shippingPrice job.ShippingPrice.
     * @return array Totals matching JobGarmentMutationResponse.totals
     *               plus the discount bookkeeping fields persisted to
     *               job.Metadata.
     */
    public static function calculate($items, $metadata, $shippingPrice)
    {
        $shippingPrice = (float) $shippingPrice;
        $itemsSubtotal = 0.0;

        foreach ($items as $item) {
            $itemsSubtotal += round(
                ((float) $item['UnitPrice']) * ((float) $item['Quantity']),
                2
            );
        }

        // Garment-only discount. Only amountOffOrder + Percentage is
        // supported (mirrors client applyDiscount()); Fixed and other
        // DiscountTypes are ignored, as in the existing behaviour.
        $discount = isset($metadata['discount']) && is_array($metadata['discount'])
            ? $metadata['discount']
            : null;
        $isPercentageDiscount = $discount !== null
            && ($discount['DiscountType'] ?? '') === 'amountOffOrder'
            && ($discount['DiscountValueType'] ?? '') === 'Percentage';

        $amountBeforeDiscount = round($itemsSubtotal, 2);
        // A discount "applies" only while there are garments to discount —
        // with an empty garment list (last-garment removal) the fields are
        // reported as reset.
        $hasDiscount = $isPercentageDiscount && $itemsSubtotal > 0;
        if ($isPercentageDiscount && $itemsSubtotal > 0) {
            $discountAmount = round(
                $itemsSubtotal * ((float) $discount['DiscountValue']) / 100,
                2
            );
            $amountAfterDiscount = round($itemsSubtotal - $discountAmount, 2);
        } else {
            $discountAmount = 0.0;
            $amountAfterDiscount = round($itemsSubtotal, 2);
        }

        // Shipping is added after the garment discount.
        $totalCost = round($amountAfterDiscount + $shippingPrice, 2);

        $paidAmount = 0.0;
        foreach (($metadata['payments'] ?? array()) as $payment) {
            $paidAmount += (float) ($payment['Amount'] ?? 0);
        }
        $paidAmount = round($paidAmount, 2);

        return array(
            'itemsSubtotal' => round($itemsSubtotal, 2),
            'discountAmount' => $discountAmount,
            'amountBeforeDiscount' => $amountBeforeDiscount,
            'amountAfterDiscount' => $amountAfterDiscount,
            'hasDiscount' => $hasDiscount,
            'shippingPrice' => round($shippingPrice, 2),
            'totalCost' => $totalCost,
            'paidAmount' => $paidAmount,
            'dueAmount' => round($totalCost - $paidAmount, 2),
        );
    }

    /**
     * Apply a calculate() result to a decoded job.Metadata array and return
     * the new metadata for persistence. Discount bookkeeping fields are
     * always written consistently (zeroed when no discount applies), so a
     * removed discount can never leave stale totals behind.
     */
    public static function applyTotalsToMetadata($metadata, $totals)
    {
        $metadata['discountAmount'] = $totals['discountAmount'];
        $metadata['amountBeforeDiscount'] = $totals['amountBeforeDiscount'];
        $metadata['amountAfterDiscount'] = $totals['amountAfterDiscount'];
        $metadata['hasDiscount'] = $totals['hasDiscount'];
        $metadata['paidAmount'] = $totals['paidAmount'];
        $metadata['dueAmount'] = $totals['dueAmount'];
        return $metadata;
    }
}
