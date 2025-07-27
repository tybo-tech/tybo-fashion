// chip.service.ts
import { Injectable } from '@angular/core';
import { Category } from './category.service';
import { Variation, VariationOption } from './variation.service';
import { Product } from 'src/models/Product';
import { ChipOption } from 'src/models/chip.model';

@Injectable({ providedIn: 'root' })
export class ChipService {
  // Convert variation options into chip options
  variationOptionsToChipOption(options: VariationOption[]): ChipOption[] {
    return options.map((opt) => ({
      id: opt.VariationOptionId.toString(),
      name: opt.Name,
    }));
  }

  // Convert category children into chip options
  categoryChildrenToChipOptions(categories: Category[]): ChipOption[] {
    return categories.map((c) => ({
      id: c.CategoryId,
      name: c.Name,
    }));
  }

  selectedCategoryIds(parentId: string, product: Product): string[] {
    if (!product) return [];
    if (!product.Categories) return [];
    return (
      product?.Categories.filter((cat) => cat.ParentId === parentId).map(
        (cat) => cat.CategoryId
      ) || []
    );
  }
  selectedVariationIds(variationId: number, product: Product): string[] {
    return (
      product?.Variations?.find(
        (varia) => Number(varia.VariationId) === Number(variationId)
      )?.Options?.map((option) => option.VariationOptionId.toString()) || []
    );
  }
}
