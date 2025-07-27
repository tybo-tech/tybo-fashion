import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Variation } from 'src/services/variation.service';

@Component({
  selector: 'app-product-variation-selector',
  templateUrl: './product-variation-selector.component.html'
})
export class ProductVariationSelectorComponent {
  @Input() variations: Variation[] = [];
  @Output() selectionChanged = new EventEmitter<any>();

  onToggleVariation(variation: Variation) {
    if (!variation._selected) {
      variation.Options?.forEach(opt => opt._selected = false);
    }
    this.emit();
  }

  emit() {
    const variationIds = this.variations
      .filter(v => v._selected)
      .map(v => v.VariationId);

    const variationOptions = this.variations
      .filter(v => v._selected)
      .flatMap(v => v.Options?.filter(opt => opt._selected))
      .map(opt => opt?.VariationOptionId);

    this.selectionChanged.emit({ variationIds, variationOptions });
  }
}
