<?php

/**
 * Sprint 5 §6 — calculation tests for the locked financial formula.
 *
 * Run: php tests/JobTotalsTest.php
 *
 * Hermetic: exercises JobTotals (pure) without a database. The transaction
 * behaviour (including rollback) is covered by tests/JobTransactionIntegrationTest.php
 * when a database is available.
 *
 * Scenarios required by the sprint:
 *   no discount, percentage discount, shipping, payments, last garment,
 *   rollback failure (integration), already-overpaid job.
 */

require_once __DIR__ . '/../models/JobTotals.php';

$failures = 0;
$checks = 0;

function check($name, $expected, $actual)
{
    global $failures, $checks;
    $checks++;
    $ok = $expected === $actual;
    if (!$ok) {
        $failures++;
        echo "FAIL  {$name}\n";
        echo '      expected: ' . var_export($expected, true) . "\n";
        echo '      actual:   ' . var_export($actual, true) . "\n";
    } else {
        echo "ok    {$name}\n";
    }
}

function item($unitPrice, $quantity)
{
    return array('UnitPrice' => $unitPrice, 'Quantity' => $quantity);
}

function percentageDiscount($value)
{
    return array(
        'DiscountType' => 'amountOffOrder',
        'DiscountValueType' => 'Percentage',
        'DiscountValue' => $value,
    );
}

// ── 1. No discount ───────────────────────────────────────────────────────
$totals = JobTotals::calculate(
    array(item(100.00, 2), item(49.99, 1)),
    array(),
    0
);
check('no discount: itemsSubtotal', 249.99, $totals['itemsSubtotal']);
check('no discount: discountAmount', 0.0, $totals['discountAmount']);
check('no discount: hasDiscount', false, $totals['hasDiscount']);
check('no discount: totalCost', 249.99, $totals['totalCost']);
check('no discount: paidAmount', 0.0, $totals['paidAmount']);
check('no discount: dueAmount', 249.99, $totals['dueAmount']);

// ── 2. Percentage discount applies to garments only ─────────────────────
$totals = JobTotals::calculate(
    array(item(200.00, 1), item(100.00, 1)),
    array('discount' => percentageDiscount(10)),
    0
);
check('percentage discount: itemsSubtotal', 300.0, $totals['itemsSubtotal']);
check('percentage discount: discountAmount', 30.0, $totals['discountAmount']);
check('percentage discount: amountBeforeDiscount', 300.0, $totals['amountBeforeDiscount']);
check('percentage discount: amountAfterDiscount', 270.0, $totals['amountAfterDiscount']);
check('percentage discount: hasDiscount', true, $totals['hasDiscount']);
check('percentage discount: totalCost (no shipping)', 270.0, $totals['totalCost']);

// ── 3. Shipping is added AFTER the garment discount ─────────────────────
$totals = JobTotals::calculate(
    array(item(300.00, 1)),
    array('discount' => percentageDiscount(10)),
    50.00
);
check('shipping after discount: totalCost', 320.0, $totals['totalCost']);
check('shipping after discount: shippingPrice', 50.0, $totals['shippingPrice']);
check('shipping after discount: discount not applied to shipping', 30.0, $totals['discountAmount']);

// ── 4. Paid amount is the sum of Metadata.payments ──────────────────────
$totals = JobTotals::calculate(
    array(item(120.00, 1)),
    array(
        'payments' => array(
            array('Amount' => 60, 'Date' => '2026-01-01', 'Type' => 'Manual'),
            array('Amount' => 30.5, 'Date' => '2026-01-02', 'Type' => 'Online'),
            array('Amount' => null), // ignored, as in the client
        ),
    ),
    0
);
check('payments: paidAmount', 90.5, $totals['paidAmount']);
check('payments: dueAmount', 29.5, $totals['dueAmount']);

// ── 5. Last garment: total falls to the remaining shipping charge and
//       metadata keeps invoice/payments/proof, loses discount fields ─────
$metadataBefore = array(
    'InvoiceNo' => 'INV42',
    'Source' => 'Online Shop',
    'paymentProof' => 'proof-url',
    'payments' => array(array('Amount' => 100, 'Date' => '2026-01-01', 'Type' => 'Manual')),
    'Special_instructions' => array(array('Details' => 'Handle with care')),
    'discount' => percentageDiscount(10),
    'discountAmount' => 30.0,
    'amountBeforeDiscount' => 300.0,
    'amountAfterDiscount' => 270.0,
    'hasDiscount' => true,
    'Logs' => array('some' => 'log'),
);

// Formula result with an empty item list and shipping preserved:
$totals = JobTotals::calculate(array(), $metadataBefore, 50.00);
check('last garment: itemsSubtotal', 0.0, $totals['itemsSubtotal']);
check('last garment: totalCost = remaining shipping', 50.0, $totals['totalCost']);
check('last garment: hasDiscount reset', false, $totals['hasDiscount']);
check('last garment: discountAmount reset', 0.0, $totals['discountAmount']);
check('last garment: paidAmount preserved', 100.0, $totals['paidAmount']);
check('last garment: dueAmount = shipping - paid (credit)', -50.0, $totals['dueAmount']);

$metadataAfter = JobTotals::applyTotalsToMetadata($metadataBefore, $totals);
check('last garment metadata: InvoiceNo preserved', 'INV42', $metadataAfter['InvoiceNo']);
check('last garment metadata: paymentProof preserved', 'proof-url', $metadataAfter['paymentProof']);
check('last garment metadata: payments preserved', 1, count($metadataAfter['payments']));
check('last garment metadata: Special_instructions preserved', 1, count($metadataAfter['Special_instructions']));
check('last garment metadata: Logs preserved', array('some' => 'log'), $metadataAfter['Logs']);
check('last garment metadata: hasDiscount reset', false, $metadataAfter['hasDiscount']);
check('last garment metadata: discountAmount reset', 0.0, $metadataAfter['discountAmount']);
check('last garment metadata: paidAmount recalculated', 100.0, $metadataAfter['paidAmount']);
check('last garment metadata: dueAmount recalculated', -50.0, $metadataAfter['dueAmount']);

// ── 6. Already-overpaid job: due goes negative, no clamping ─────────────
$totals = JobTotals::calculate(
    array(item(80.00, 1)),
    array('payments' => array(array('Amount' => 100, 'Date' => '2026-01-01', 'Type' => 'Manual'))),
    0
);
check('overpaid: paidAmount', 100.0, $totals['paidAmount']);
check('overpaid: dueAmount negative', -20.0, $totals['dueAmount']);

// ── 7. Rounding: per-item SubTotal rounded, then summed ─────────────────
$totals = JobTotals::calculate(
    array(item(33.333, 1), item(0.005, 1)),
    array(),
    0.01
);
check('rounding: itemsSubtotal rounds per item then sums', 33.34, $totals['itemsSubtotal']);
check('rounding: totalCost', 33.35, $totals['totalCost']);

// ── 8. Non-percentage discount types are ignored (client parity) ────────
$totals = JobTotals::calculate(
    array(item(100.00, 1)),
    array('discount' => array(
        'DiscountType' => 'amountOffOrder',
        'DiscountValueType' => 'Fixed',
        'DiscountValue' => 50,
    )),
    0
);
check('fixed discount ignored: totalCost', 100.0, $totals['totalCost']);
check('fixed discount ignored: hasDiscount', false, $totals['hasDiscount']);

echo "\n{$checks} checks, {$failures} failures\n";
exit($failures === 0 ? 0 : 1);
