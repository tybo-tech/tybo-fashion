import {
  normalizeHomeProduct,
  toDeposit,
  toStockLabel,
} from './HomeFeed';

describe('HomeFeed normalisers', () => {
  describe('toStockLabel', () => {
    it('prefers a server-provided label', () => {
      expect(toStockLabel({ StockLabel: 'Made to order' })).toBe(
        'Made to order'
      );
    });

    it('maps StockType values', () => {
      expect(toStockLabel({ StockType: 'Stock product' })).toBe(
        'Ready to wear'
      );
      expect(toStockLabel({ StockType: 'Made To Order' })).toBe(
        'Made to order'
      );
    });

    it('maps IsJustInTime values', () => {
      expect(toStockLabel({ IsJustInTime: 'Ready to wear' })).toBe(
        'Ready to wear'
      );
      expect(toStockLabel({ IsJustInTime: 'Custom' })).toBe('Made to order');
    });

    it('trusts made-to-order when the two columns disagree', () => {
      expect(
        toStockLabel({
          StockType: 'Made To Order',
          IsJustInTime: 'Ready to wear',
        })
      ).toBe('Made to order');
      expect(
        toStockLabel({
          StockType: 'Stock product',
          IsJustInTime: 'Custom',
        })
      ).toBe('Made to order');
    });

    it('returns empty when nothing is usable', () => {
      expect(toStockLabel({})).toBe('');
      expect(toStockLabel({ StockType: 'nonsense' })).toBe('');
    });
  });

  describe('toDeposit', () => {
    it('prefers a server computed deposit', () => {
      expect(toDeposit({ Deposit: 375, RegularPrice: 750 })).toBe(375);
    });

    it('falls back to 50% of the price', () => {
      expect(toDeposit({ RegularPrice: 750 })).toBe(375);
      expect(toDeposit({ RegularPrice: '2500' })).toBe(1250);
    });

    it('returns zero for missing or invalid prices', () => {
      expect(toDeposit({})).toBe(0);
      expect(toDeposit({ RegularPrice: 'N/A' })).toBe(0);
      expect(toDeposit({ RegularPrice: 0 })).toBe(0);
    });
  });

  describe('normalizeHomeProduct', () => {
    it('normalises a full feed row', () => {
      const product = normalizeHomeProduct({
        Id: 754,
        ProductId: 'product-754',
        Slug: 'mini-skirt',
        Name: 'Mini length ostrich leather skirt',
        RegularPrice: 750,
        Deposit: 375,
        FeaturedImageUrl: 'https://cdn/img.png',
        CompanyId: 'shop-1',
        StockType: 'Made To Order',
        IsJustInTime: 'Ready to wear',
        StockLabel: 'Made to order',
        Images: ['a.png', 'b.png'],
        Designer: {
          Name: 'Zalou creatives for Zalou Wardrobe ',
          Slug: 'zalou',
          Logo: 'logo.jpg',
          City: 'Northriding',
        },
      });

      expect(product.RegularPrice).toBe(750);
      expect(product.Deposit).toBe(375);
      expect(product.StockLabel).toBe('Made to order');
      expect(product.Images).toEqual(['a.png', 'b.png']);
      expect(product.Designer.Name).toBe('Zalou creatives for Zalou Wardrobe');
      expect(product.Designer.Slug).toBe('zalou');
    });

    it('tolerates a legacy partial row', () => {
      const product = normalizeHomeProduct({
        Name: 'Legacy item',
        RegularPrice: '1200',
        IsJustInTime: 'Custom',
      });

      expect(product.RegularPrice).toBe(1200);
      expect(product.Deposit).toBe(600);
      expect(product.StockLabel).toBe('Made to order');
      expect(product.FeaturedImageUrl).toBe('');
      expect(product.Images).toEqual([]);
      expect(product.Designer.Name).toBe('');
      expect(product.OldPrice).toBeNull();
    });

    it('drops falsy image entries', () => {
      const product = normalizeHomeProduct({
        RegularPrice: 100,
        Images: ['a.png', '', null as any],
      });
      expect(product.Images).toEqual(['a.png']);
    });
  });
});
