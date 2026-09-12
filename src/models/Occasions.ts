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
  ImageUrl: string;
  Link: string;
}

interface OccasionMatcher {
  Name: string;
  keywords: string[];
}

/**
 * Ordered, shopper-facing occasions. Order is intentional: the most
 * South-African-relevant intents come first. Matching is keyword based and
 * case-insensitive against both the item Name and ItemValue.title.
 */
export const OCCASION_MATCHERS: OccasionMatcher[] = [
  { Name: 'Matric Dance', keywords: ['matric'] },
  { Name: 'Wedding Guest', keywords: ['wedding guest', 'guest'] },
  { Name: 'Bridal', keywords: ['bridal', 'bride', 'wedding dress'] },
  {
    Name: 'Traditional',
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
  { Name: 'Graduation', keywords: ['graduation', 'grad'] },
  { Name: 'Birthday', keywords: ['birthday'] },
  { Name: 'Durban July', keywords: ['durban july', 'july'] },
  { Name: 'High Tea', keywords: ['high tea', 'tea'] },
];

/**
 * Build the occasion rail from work-gallery items. Only occasions that have a
 * matching, imaged item are returned, so the rail never shows an empty tile.
 * A gallery item is consumed at most once, keeping the images varied.
 */
export function buildOccasions(
  items: Array<OtherInfo<IWorkGallery> | any> | null | undefined,
  linkFor: (item: any) => string
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
        ImageUrl: match.ImageUrl || match.ItemValue?.coverImage,
        Link: linkFor(match),
      });
    }
  }

  return occasions;
}
