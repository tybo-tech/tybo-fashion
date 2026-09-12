/**
 * Marketplace homepage feed shapes and normalisation.
 *
 * The `/products/home-feed.php` endpoint already normalises stock labels,
 * JSON columns and the 50% deposit server-side, so the frontend helper here
 * is defensive only: it tolerates legacy/partial payloads (e.g. rows coming
 * from older `Product` responses) and guarantees the card has a usable
 * price, deposit and stock label.
 */

export interface FeedDesigner {
  Name: string;
  Slug: string;
  Logo: string;
  City: string;
}

export interface HomeProduct {
  Id: number | string;
  ProductId: string;
  Slug: string;
  Name: string;
  RegularPrice: number;
  OldPrice?: number | null;
  Deposit: number;
  FeaturedImageUrl: string;
  Description: string;
  CompanyId: string;
  StockType: string;
  IsJustInTime: string;
  StockLabel: string;
  StatusId: number;
  ShowOnline: string;
  IsFeatured: string;
  Images: string[];
  Metadata: unknown;
  CreateDate: string;
  Designer: FeedDesigner;
}

export function initFeedDesigner(): FeedDesigner {
  return { Name: '', Slug: '', Logo: '', City: '' };
}

/**
 * Canonical shopper-facing stock label. Mirrors models/HomeFeed.php:
 * StockType ("Stock product" | "Made To Order") and IsJustInTime
 * ("Ready to wear" | "Custom") are two halves of the same question, so when
 * they disagree the made-to-order/custom signal wins.
 */
export function toStockLabel(product: {
  StockLabel?: string;
  StockType?: string;
  IsJustInTime?: string;
}): string {
  const provided = (product.StockLabel || '').trim();
  if (provided) {
    return provided;
  }

  const labels: string[] = [];
  for (const value of [product.StockType, product.IsJustInTime]) {
    const label = matchStockLabel(value);
    if (label) {
      labels.push(label);
    }
  }
  if (labels.includes('Made to order')) {
    return 'Made to order';
  }
  return labels.length ? 'Ready to wear' : '';
}

/**
 * The platform deposit rule is 50% of the price. Prefer a server-computed
 * Deposit when present so the rule has a single source of truth.
 */
export function toDeposit(product: {
  Deposit?: number | string;
  RegularPrice?: number | string;
}): number {
  const deposit = Number(product.Deposit);
  if (!isNaN(deposit) && deposit > 0) {
    return deposit;
  }
  const price = Number(product.RegularPrice);
  return isNaN(price) || price <= 0 ? 0 : Math.round(price * 0.5 * 100) / 100;
}

function matchStockLabel(value?: string): string {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) {
    return '';
  }
  if (
    normalized.includes('make') ||
    normalized.includes('custom') ||
    normalized.includes('order')
  ) {
    return 'Made to order';
  }
  if (normalized.includes('stock') || normalized.includes('ready')) {
    return 'Ready to wear';
  }
  return '';
}

/**
 * Normalise one feed row: numbers, image array, stock label, deposit and a
 * designer object. Safe to run on already-normalised server rows.
 */
export function normalizeHomeProduct(raw: any): HomeProduct {
  const image = (raw.FeaturedImageUrl || '').toString().trim();
  const designer: FeedDesigner = {
    Name: (raw.Designer?.Name || '').toString().trim(),
    Slug: (raw.Designer?.Slug || '').toString().trim(),
    Logo: (raw.Designer?.Logo || '').toString().trim(),
    City: (raw.Designer?.City || '').toString().trim(),
  };

  return {
    Id: raw.Id ?? '',
    ProductId: raw.ProductId ?? '',
    Slug: raw.Slug ?? '',
    Name: (raw.Name || '').toString(),
    RegularPrice: Number(raw.RegularPrice) || 0,
    OldPrice:
      raw.OldPrice === undefined || raw.OldPrice === null
        ? null
        : Number(raw.OldPrice) || 0,
    Deposit: toDeposit(raw),
    FeaturedImageUrl: image,
    Description: (raw.Description || '').toString(),
    CompanyId: raw.CompanyId ?? '',
    StockType: raw.StockType ?? '',
    IsJustInTime: raw.IsJustInTime ?? '',
    StockLabel: toStockLabel(raw),
    StatusId: Number(raw.StatusId) || 0,
    ShowOnline: raw.ShowOnline ?? '',
    IsFeatured: raw.IsFeatured ?? 'No',
    Images: Array.isArray(raw.Images) ? raw.Images.filter(Boolean) : [],
    Metadata: raw.Metadata ?? null,
    CreateDate: raw.CreateDate ?? '',
    Designer: designer,
  };
}
