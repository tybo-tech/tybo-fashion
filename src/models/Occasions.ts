import { IWorkGallery } from './IWorkGallery';
import { OtherInfo } from './other-info.model';

/**
 * "Shop by occasion" is derived from real WorkGallery content rather than a
 * synthetic catalogue taxonomy: the platform has no product category data yet,
 * but designers already tag their portfolio pieces by occasion (matric dance,
 * bridal, traditional, etc.). Each occasion tile links to the matching piece.
 */
export interface Occasion {
  Name: string;
  Slug: string;
  ImageUrl: string;
  Count?: number;
  Link: string;
}

/** Shape returned by GET /other_info/occasions.php */
export interface OccasionSummary {
  Name: string;
  Slug: string;
  ImageUrl: string;
  Count: number;
}

/** Shape returned by GET /other_info/occasion.php */
export interface OccasionGallery {
  Occasion: { Name: string; Slug: string };
  Items: Array<OtherInfo<IWorkGallery> & { Company?: any }>;
}

export function occasionLink(slug: string): string {
  return `/home/occasions/${slug}`;
}

interface OccasionMatcher {
  Name: string;
  Slug: string;
  keywords: string[];
}

/**
 * Ordered, shopper-facing occasions. Order is intentional: the most
 * South-African-relevant intents come first. Matching is keyword based and
 * case-insensitive against both the item Name and ItemValue.title.
 *
 * Kept in sync with models/OccasionCatalog.php (the server is the source of
 * truth for the occasion pages; this mirrors it for the homepage rail).
 */
export const OCCASION_MATCHERS: OccasionMatcher[] = [
  { Name: 'Matric Dance', Slug: 'matric-dance', keywords: ['matric'] },
  { Name: 'Wedding Guest', Slug: 'wedding-guest', keywords: ['wedding guest', 'guest'] },
  { Name: 'Bridal', Slug: 'bridal', keywords: ['bridal', 'bride', 'wedding dress'] },
  {
    Name: 'Traditional',
    Slug: 'traditional',
    keywords: [
      'traditional',
      'zulu',
      'xhosa',
      'sepedi',
      'shweshwe',
      'tsonga',
      'tswana',
      'pedi',
    ],
  },
  { Name: 'Graduation', Slug: 'graduation', keywords: ['graduation', 'grad'] },
  { Name: 'Birthday', Slug: 'birthday', keywords: ['birthday'] },
  { Name: 'Durban July', Slug: 'durban-july', keywords: ['durban july', 'july'] },
  { Name: 'High Tea', Slug: 'high-tea', keywords: ['high tea', 'tea'] },
];

/**
 * Build the occasion rail from work-gallery items. Only occasions that have a
 * matching, imaged item are returned, so the rail never shows an empty tile.
 * A gallery item is consumed at most once, keeping the images varied.
 *
 * Tiles link to the cross-designer occasion page (`/home/occasions/:slug`),
 * not to an individual gallery piece.
 */
export function buildOccasions(
  items: Array<OtherInfo<IWorkGallery> | any> | null | undefined
): Occasion[] {
  if (!items || !items.length) {
    return [];
  }

  const used = new Set<any>();
  const occasions: Occasion[] = [];

  for (const matcher of OCCASION_MATCHERS) {
    const match = items.find((item) => {
      if (!item || used.has(item)) {
        return false;
      }
      const image = item.ImageUrl || item.ItemValue?.coverImage;
      if (!image) {
        return false;
      }
      const haystack = [
        item.Name,
        item.ItemValue?.title,
        item.Decription,
        item.ItemValue?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matcher.keywords.some((keyword) => haystack.includes(keyword));
    });

    if (match) {
      used.add(match);
      occasions.push({
        Name: matcher.Name,
        Slug: matcher.Slug,
        ImageUrl: match.ImageUrl || match.ItemValue?.coverImage,
        Link: occasionLink(matcher.Slug),
      });
    }
  }

  return occasions;
}
