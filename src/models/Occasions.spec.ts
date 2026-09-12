import { buildOccasions, OCCASION_MATCHERS } from './Occasions';

function galleryItem(overrides: any = {}) {
  const name = overrides.Name ?? 'Matric dance dress';
  const image = overrides.ImageUrl ?? 'https://cdn/matric.jpg';
  const merged: any = {
    Id: 1,
    Name: name,
    ImageUrl: image,
    ItemValue: { title: name, coverImage: image },
    ...overrides,
  };
  // Keep ItemValue.title/coverImage in sync with Name/ImageUrl unless the
  // caller supplied an explicit ItemValue.
  if (!('ItemValue' in overrides)) {
    merged.ItemValue = { title: merged.Name, coverImage: merged.ImageUrl };
  }
  return merged;
}

describe('buildOccasions', () => {
  it('returns nothing for empty or missing input', () => {
    expect(buildOccasions([], () => '/x')).toEqual([]);
    expect(buildOccasions(null, () => '/x')).toEqual([]);
    expect(buildOccasions(undefined, () => '/x')).toEqual([]);
  });

  it('matches real work-gallery titles to occasions in order', () => {
    const items = [
      galleryItem({ Id: 1, Name: 'Matric dance dress' }),
      galleryItem({ Id: 2, Name: 'Sepedi wedding guest dress' }),
      galleryItem({ Id: 3, Name: 'Shweshwe bridal dress and headpiece' }),
      galleryItem({ Id: 4, Name: 'Modern traditional bridal dress and headpiece' }),
      galleryItem({ Id: 5, Name: 'Graduation dress' }),
      galleryItem({ Id: 6, Name: 'Birthday celebration dress' }),
      galleryItem({ Id: 7, Name: 'Durban July 2024' }),
      galleryItem({ Id: 8, Name: 'High tea outfit' }),
    ];

    const occasions = buildOccasions(items, (item) => `/home/work-show-details/${item.Id}`);
    const names = occasions.map((o) => o.Name);

    expect(names).toEqual([
      'Matric Dance',
      'Wedding Guest',
      'Bridal',
      'Traditional',
      'Graduation',
      'Birthday',
      'Durban July',
      'High Tea',
    ]);
    expect(occasions[0].Link).toBe('/home/work-show-details/1');
    expect(occasions[0].ImageUrl).toBe('https://cdn/matric.jpg');
  });

  it('skips occasions with no matching item', () => {
    const items = [galleryItem({ Id: 9, Name: 'Durban July 2024' })];
    const occasions = buildOccasions(items, (item) => `/x/${item.Id}`);
    expect(occasions.map((o) => o.Name)).toEqual(['Durban July']);
  });

  it('skips items without an image', () => {
    const items = [galleryItem({ Id: 1, Name: 'Matric dance dress', ImageUrl: '', ItemValue: { title: 'Matric dance dress', coverImage: '' } })];
    expect(buildOccasions(items, () => '/x')).toEqual([]);
  });

  it('consumes each gallery item at most once', () => {
    // One "wedding guest" item should fill Wedding Guest only, not Bridal too.
    const items = [galleryItem({ Id: 1, Name: 'Wedding guest couple outfit' })];
    const occasions = buildOccasions(items, () => '/x');
    const weddingGuestCount = occasions.filter((o) => o.Name === 'Wedding Guest').length;
    expect(weddingGuestCount).toBe(1);
    expect(occasions.length).toBe(1);
  });

  it('falls back to ItemValue.title and coverImage', () => {
    const items = [
      {
        Id: 7,
        Name: '',
        ImageUrl: '',
        ItemValue: { title: 'Birthday shoot dress', coverImage: 'https://cdn/bday.jpg' },
      },
    ];
    const occasions = buildOccasions(items, () => '/x');
    expect(occasions[0].Name).toBe('Birthday');
    expect(occasions[0].ImageUrl).toBe('https://cdn/bday.jpg');
  });

  it('exposes a non-empty, uniquely named matcher list', () => {
    const names = OCCASION_MATCHERS.map((m) => m.Name);
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
  });
});
