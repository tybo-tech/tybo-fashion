<?php

/**
 * Hermetic tests for models/OccasionCatalog.php (no database).
 *
 * Run: php tests/OccasionCatalogTest.php
 */

require_once __DIR__ . '/../models/OccasionCatalog.php';

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

function galleryItem($name, $company = 'Zalou', $title = null)
{
    return [
        'Id' => crc32($name),
        'Name' => $name,
        'ItemValue' => [
            'title' => $title ?? $name,
            'coverImage' => 'https://cdn/' . OccasionCatalog::slugify($name) . '.jpg',
        ],
        'ParentId' => 'company-' . $company,
        'ImageUrl' => 'https://cdn/' . OccasionCatalog::slugify($name) . '.jpg',
    ];
}

// ── match ────────────────────────────────────────────────────────────────
check('match: matric', 'Matric Dance', OccasionCatalog::match(['Matric dance dress'])['Name']);
check('match: wedding guest', 'Wedding Guest', OccasionCatalog::match(['Sepedi wedding guest dress'])['Name']);
check('match: bridal', 'Bridal', OccasionCatalog::match(['Shweshwe bridal dress'])['Name']);
check('match: traditional via zulu', 'Traditional', OccasionCatalog::match(['Zulu traditional look'])['Name']);
check('match: first in order wins (bridal before traditional)', 'Bridal', OccasionCatalog::match(['Zulu traditional bridal look'])['Name']);
check('match: graduation', 'Graduation', OccasionCatalog::match(['Graduation'])['Name']);
check('match: birthday', 'Birthday', OccasionCatalog::match(['Birthday celebration dress'])['Name']);
check('match: durban july', 'Durban July', OccasionCatalog::match(['Durban July 2024'])['Name']);
check('match: high tea', 'High Tea', OccasionCatalog::match(['High tea outfit'])['Name']);
check('match: case-insensitive', 'Matric Dance', OccasionCatalog::match(['MATRIC DANCE'])['Name']);
check('match: checks all parts', 'Birthday', OccasionCatalog::match(['Untitled', 'birthday shoot'])['Name']);
check('match: no match is null', null, OccasionCatalog::match(['Ostrich leather coat']));
check('match: empty is null', null, OccasionCatalog::match(['', '']));
check('match: non-string parts ignored', 'Birthday', OccasionCatalog::match([['x'], 'birthday'])['Name']);

// ── matchAll ─────────────────────────────────────────────────────────────
$multiMatch = array_map(fn($o) => $o['Name'], OccasionCatalog::matchAll(['Zulu traditional bridal look']));
check('matchAll: returns bridal and traditional', ['Bridal', 'Traditional'], $multiMatch);
check('matchAll: single match', ['Matric Dance'], array_map(fn($o) => $o['Name'], OccasionCatalog::matchAll(['matric dress'])));
check('matchAll: none is empty', [], OccasionCatalog::matchAll(['Ostrich leather coat']));
check('matchAll: empty', [], OccasionCatalog::matchAll(['', '']));

// ── slugify / findBySlug ─────────────────────────────────────────────────
check('slugify: spaces', 'matric-dance', OccasionCatalog::slugify('Matric Dance'));
check('slugify: punctuation', 'high-tea', OccasionCatalog::slugify('  High   Tea! '));
check('findBySlug: known', 'Bridal', OccasionCatalog::findBySlug('bridal')['Name']);
check('findBySlug: normalises input', 'Durban July', OccasionCatalog::findBySlug('Durban-July')['Name']);
check('findBySlug: unknown is null', null, OccasionCatalog::findBySlug('nonsense'));

// ── groupByOccasion ──────────────────────────────────────────────────────
$items = [
    galleryItem('Matric dance dress'),
    galleryItem('Sepedi wedding guest dress'),
    galleryItem('Zulu traditional bridal dress and headpiece'),
    galleryItem('Graduation dress'),
    galleryItem('Ostrich leather coat'),
];
$grouped = OccasionCatalog::groupByOccasion($items);
check('group: matric bucket', 1, count($grouped['matric-dance'] ?? []));
check('group: wedding guest bucket', 1, count($grouped['wedding-guest'] ?? []));
check('group: bridal bucket', 1, count($grouped['bridal'] ?? []));
// Traditional holds both the Zulu bridal piece and the Sepedi wedding guest
// piece — a piece can legitimately match several occasions.
check('group: traditional bucket', 2, count($grouped['traditional'] ?? []));
check('group: unmatchable excluded', false, isset($grouped['ostrich-leather-coat']));

$multi = OccasionCatalog::groupByOccasion([
    galleryItem('Zulu traditional bridal dress and headpiece'),
]);
check('group: one piece can match multiple occasions (traditional)', 1, count($multi['traditional'] ?? []));
check('group: one piece can match multiple occasions (bridal)', 1, count($multi['bridal'] ?? []));

// ── taxonomy integrity ───────────────────────────────────────────────────
$slugs = array_map(fn($o) => $o['Slug'], OccasionCatalog::OCCASIONS);
check('taxonomy: unique slugs', count($slugs), count(array_unique($slugs)));
check('taxonomy: non-empty', true, count(OccasionCatalog::OCCASIONS) > 0);
$names = array_map(fn($o) => $o['Name'], OccasionCatalog::OCCASIONS);
check('taxonomy: unique names', count($names), count(array_unique($names)));

echo "\n{$checks} checks, {$failures} failures\n";
exit($failures === 0 ? 0 : 1);
