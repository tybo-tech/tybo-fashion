<?php

/**
 * Hermetic tests for models/HomeFeed.php (no database).
 *
 * Run: php tests/HomeFeedTest.php
 *
 * Covers the homepage eligibility rules, stock-type normalisation, JSON
 * cleanup ("null" vs null / arrays stored as JSON strings), the 50% deposit
 * and the shop-diversity algorithm.
 */

require_once __DIR__ . '/../models/HomeFeed.php';

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

function eligibleRow(array $overrides = array())
{
    return array_merge(
        array(
            'Id' => 1,
            'ProductId' => 'p-1',
            'Name' => 'Ostrich leather skirt',
            'CompanyId' => 'shop-a',
            'RegularPrice' => '750',
            'FeaturedImageUrl' => 'https://cdn/img-1.jpg',
            'ShowOnline' => '1',
            'StatusId' => 1,
            'ShopStatusId' => 1,
            'ShopIsDeleted' => 0,
            'StockType' => 'Made To Order',
            'IsJustInTime' => 'Ready to wear',
            'Images' => '["https://cdn/a.jpg","https://cdn/b.jpg"]',
            'Metadata' => 'null',
            'ShopName' => 'Zalou',
            'ShopSlug' => 'zalou',
            'ShopLogo' => 'https://cdn/logo.jpg',
            'ShopCity' => 'Northriding',
        ),
        $overrides
    );
}

// ── isEligible ───────────────────────────────────────────────────────────
check('eligible: happy path', true, HomeFeed::isEligible(eligibleRow()));
check('eligible: ShowOnline true string', true, HomeFeed::isEligible(eligibleRow(array('ShowOnline' => 'true'))));
check('eligible: ShowOnline 1 int', true, HomeFeed::isEligible(eligibleRow(array('ShowOnline' => 1))));
check('eligible: ShowOnline 0 string', false, HomeFeed::isEligible(eligibleRow(array('ShowOnline' => '0'))));
check('eligible: ShowOnline null', false, HomeFeed::isEligible(eligibleRow(array('ShowOnline' => null))));
check('eligible: StatusId 999 (deleted)', false, HomeFeed::isEligible(eligibleRow(array('StatusId' => 999))));
check('eligible: StatusId 0', false, HomeFeed::isEligible(eligibleRow(array('StatusId' => 0))));
check('eligible: empty image', false, HomeFeed::isEligible(eligibleRow(array('FeaturedImageUrl' => '  '))));
check('eligible: zero price', false, HomeFeed::isEligible(eligibleRow(array('RegularPrice' => '0'))));
check('eligible: negative price', false, HomeFeed::isEligible(eligibleRow(array('RegularPrice' => '-50'))));
check('eligible: garbage price', false, HomeFeed::isEligible(eligibleRow(array('RegularPrice' => 'N/A'))));
check('eligible: empty name', false, HomeFeed::isEligible(eligibleRow(array('Name' => '   '))));
check('eligible: no company', false, HomeFeed::isEligible(eligibleRow(array('CompanyId' => ''))));
check('eligible: inactive shop', false, HomeFeed::isEligible(eligibleRow(array('ShopStatusId' => 999))));
check('eligible: deleted shop', false, HomeFeed::isEligible(eligibleRow(array('ShopIsDeleted' => 1))));
check('eligible: no product id', false, HomeFeed::isEligible(eligibleRow(array('Id' => '', 'ProductId' => ''))));

// ── stockLabel ───────────────────────────────────────────────────────────
check('stock: Made To Order', 'Made to order', HomeFeed::stockLabel('Made To Order', null));
check('stock: Stock product', 'Ready to wear', HomeFeed::stockLabel('Stock product', null));
check('stock: IsJustInTime Ready to wear', 'Ready to wear', HomeFeed::stockLabel(null, 'Ready to wear'));
check('stock: IsJustInTime Custom', 'Made to order', HomeFeed::stockLabel(null, 'Custom'));
check('stock: MTO StockType wins over Ready to wear', 'Made to order', HomeFeed::stockLabel('Made To Order', 'Ready to wear'));
check('stock: Custom wins over Stock product', 'Made to order', HomeFeed::stockLabel('Stock product', 'Custom'));
check('stock: both empty', '', HomeFeed::stockLabel('', ''));
check('stock: unknown values', '', HomeFeed::stockLabel('whatever', 'also-whatever'));

// ── normalizeRow ─────────────────────────────────────────────────────────
$normalized = HomeFeed::normalizeRow(eligibleRow());
check('normalize: price is float', 750.0, $normalized['RegularPrice']);
check('normalize: deposit is half', 375.0, $normalized['Deposit']);
check('normalize: images decoded', array('https://cdn/a.jpg', 'https://cdn/b.jpg'), $normalized['Images']);
check('normalize: metadata "null" becomes null', null, $normalized['Metadata']);
check('normalize: stock label', 'Made to order', $normalized['StockLabel']);
check('normalize: designer name', 'Zalou', $normalized['Designer']['Name']);
check('normalize: designer slug', 'zalou', $normalized['Designer']['Slug']);
check('normalize: designer city', 'Northriding', $normalized['Designer']['City']);
check('normalize: shop keys stripped', false, array_key_exists('ShopName', $normalized));

$spaced = HomeFeed::normalizeRow(eligibleRow(array('ShopName' => 'Zalou creatives for Zalou Wardrobe ')));
check('normalize: designer name trimmed', 'Zalou creatives for Zalou Wardrobe', $spaced['Designer']['Name']);

$withMeta = HomeFeed::normalizeRow(eligibleRow(array('Metadata' => '{"Slides":[1]}')));
check('normalize: metadata decoded', array('Slides' => array(1)), $withMeta['Metadata']);

$oldPrice = HomeFeed::normalizeRow(eligibleRow(array('OldPrice' => '900')));
check('normalize: old price float', 900.0, $oldPrice['OldPrice']);

$noImages = HomeFeed::normalizeRow(eligibleRow(array('Images' => null)));
check('normalize: null images becomes array', array(), $noImages['Images']);

// ── diversify ────────────────────────────────────────────────────────────
$rows = array(
    eligibleRow(array('Id' => 1, 'CompanyId' => 'shop-a', 'Name' => 'Coat A', 'FeaturedImageUrl' => 'i1')),
    eligibleRow(array('Id' => 2, 'CompanyId' => 'shop-a', 'Name' => 'Coat A', 'FeaturedImageUrl' => 'i2')),
    eligibleRow(array('Id' => 3, 'CompanyId' => 'shop-a', 'Name' => 'Skirt B', 'FeaturedImageUrl' => 'i3')),
    eligibleRow(array('Id' => 4, 'CompanyId' => 'shop-a', 'Name' => 'Top C', 'FeaturedImageUrl' => 'i4')),
    eligibleRow(array('Id' => 5, 'CompanyId' => 'shop-b', 'Name' => 'Dress D', 'FeaturedImageUrl' => 'i5')),
    eligibleRow(array('Id' => 6, 'CompanyId' => 'shop-b', 'Name' => 'Dress E', 'FeaturedImageUrl' => 'i6')),
);
$picked = HomeFeed::diversify($rows, 4, 2);
$pickedIds = array_map(fn($r) => $r['Id'], $picked);
check('diversify: returns target count', 4, count($picked));
check('diversify: cap 2 per shop', array(1, 3, 5, 6), $pickedIds);

$singleShop = array(
    eligibleRow(array('Id' => 1, 'CompanyId' => 'only', 'Name' => 'A', 'FeaturedImageUrl' => 'i1')),
    eligibleRow(array('Id' => 2, 'CompanyId' => 'only', 'Name' => 'B', 'FeaturedImageUrl' => 'i2')),
    eligibleRow(array('Id' => 3, 'CompanyId' => 'only', 'Name' => 'C', 'FeaturedImageUrl' => 'i3')),
);
check('diversify: second pass relaxes cap', 3, count(HomeFeed::diversify($singleShop, 3, 1)));

$dupImage = array(
    eligibleRow(array('Id' => 1, 'CompanyId' => 's', 'Name' => 'A', 'FeaturedImageUrl' => 'same')),
    eligibleRow(array('Id' => 2, 'CompanyId' => 's', 'Name' => 'B', 'FeaturedImageUrl' => 'same')),
);
check('diversify: duplicate image skipped', 1, count(HomeFeed::diversify($dupImage, 5, 5)));

// ── build ────────────────────────────────────────────────────────────────
$primary = array(
    eligibleRow(array('Id' => 1, 'CompanyId' => 'a', 'Name' => 'P1', 'FeaturedImageUrl' => 'i1')),
    eligibleRow(array('Id' => 2, 'CompanyId' => 'a', 'Name' => 'P2', 'FeaturedImageUrl' => 'i2')),
    eligibleRow(array('Id' => 9, 'CompanyId' => 'a', 'Name' => 'Hidden', 'ShowOnline' => '0', 'FeaturedImageUrl' => 'i9')),
);
$fallback = array(
    eligibleRow(array('Id' => 2, 'CompanyId' => 'a', 'Name' => 'P2 dup', 'FeaturedImageUrl' => 'i2')),
    eligibleRow(array('Id' => 3, 'CompanyId' => 'b', 'Name' => 'F1', 'IsFeatured' => 'Yes', 'FeaturedImageUrl' => 'i3')),
);
$feed = HomeFeed::build($primary, $fallback, 8, 2);
$feedIds = array_map(fn($r) => $r['Id'], $feed);
check('build: drops ineligible', false, in_array(9, $feedIds, true));
check('build: dedupes primary vs fallback', 3, count($feed));
check('build: normalised output', true, isset($feed[0]['Designer'], $feed[0]['Deposit'], $feed[0]['StockLabel']));

check('build: empty input', array(), HomeFeed::build(array(), array(), 8));

echo "\n{$checks} checks, {$failures} failures\n";
exit($failures === 0 ? 0 : 1);
