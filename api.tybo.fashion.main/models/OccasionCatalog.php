<?php

/**
 * Pure, DB-free occasion taxonomy and matching.
 *
 * Occasions live on WorkGallery items, not products: the platform has no
 * product category/occasion data yet. So "shop by occasion" is a cross-designer
 * portfolio experience — a shopper picks Matric Dance, Bridal, Traditional etc.
 * and sees real pieces made for that moment, then can start a made-to-order
 * conversation with the designer.
 *
 * Centralised here so the homepage rail, the occasion index and the occasion
 * detail endpoint all agree on names, slugs and keywords.
 */
class OccasionCatalog
{
    /**
     * Ordered, shopper-facing occasions. Order is intentional: the most
     * South-African-relevant intents come first.
     */
    public const OCCASIONS = [
        ['Name' => 'Matric Dance', 'Slug' => 'matric-dance', 'Keywords' => ['matric']],
        ['Name' => 'Wedding Guest', 'Slug' => 'wedding-guest', 'Keywords' => ['wedding guest', 'guest']],
        ['Name' => 'Bridal', 'Slug' => 'bridal', 'Keywords' => ['bridal', 'bride', 'wedding dress']],
        [
            'Name' => 'Traditional',
            'Slug' => 'traditional',
            'Keywords' => ['traditional', 'zulu', 'xhosa', 'sepedi', 'shweshwe', 'tsonga', 'tswana', 'pedi'],
        ],
        ['Name' => 'Graduation', 'Slug' => 'graduation', 'Keywords' => ['graduation', 'grad']],
        ['Name' => 'Birthday', 'Slug' => 'birthday', 'Keywords' => ['birthday']],
        ['Name' => 'Durban July', 'Slug' => 'durban-july', 'Keywords' => ['durban july', 'july']],
        ['Name' => 'High Tea', 'Slug' => 'high-tea', 'Keywords' => ['high tea', 'tea']],
    ];

    /**
     * Return the occasion meta whose keywords appear in the given text, or null.
     * Case-insensitive. First match in OCCASIONS order wins. Use matchAll() when
     * a piece may belong to more than one occasion.
     */
    public static function match(array $textParts): ?array
    {
        $haystack = self::haystack($textParts);
        if ($haystack === '') {
            return null;
        }

        foreach (self::OCCASIONS as $occasion) {
            foreach ($occasion['Keywords'] as $keyword) {
                if (strpos($haystack, $keyword) !== false) {
                    return $occasion;
                }
            }
        }
        return null;
    }

    /**
     * Every occasion the given text matches, in OCCASIONS order. A piece like
     * "Zulu traditional bridal dress" is both Traditional and Bridal.
     */
    public static function matchAll(array $textParts): array
    {
        $haystack = self::haystack($textParts);
        if ($haystack === '') {
            return [];
        }

        $matches = [];
        foreach (self::OCCASIONS as $occasion) {
            foreach ($occasion['Keywords'] as $keyword) {
                if (strpos($haystack, $keyword) !== false) {
                    $matches[] = $occasion;
                    break;
                }
            }
        }
        return $matches;
    }

    private static function haystack(array $textParts): string
    {
        $parts = array_filter(array_map(function ($part) {
            return is_scalar($part) ? (string) $part : '';
        }, $textParts));
        return trim(strtolower(implode(' ', $parts)));
    }

    public static function findBySlug(string $slug): ?array
    {
        $slug = self::slugify($slug);
        foreach (self::OCCASIONS as $occasion) {
            if ($occasion['Slug'] === $slug) {
                return $occasion;
            }
        }
        return null;
    }

    public static function slugify(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9]+/', '-', $value);
        return trim($value, '-');
    }

    /**
     * Group a flat list of decoded gallery items by every occasion they match.
     * A single piece can legitimately appear under more than one occasion
     * (e.g. a "Zulu traditional bridal dress" is both Traditional and Bridal).
     *
     * @return array<string, array> keyed by occasion slug
     */
    public static function groupByOccasion(array $items): array
    {
        $grouped = [];
        foreach ($items as $item) {
            $matches = self::matchAll([
                $item['Name'] ?? '',
                $item['ItemValue']['title'] ?? '',
                $item['Decription'] ?? '',
                $item['ItemValue']['description'] ?? '',
            ]);
            foreach ($matches as $meta) {
                $grouped[$meta['Slug']][] = $item;
            }
        }
        return $grouped;
    }
}
