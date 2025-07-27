import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Category } from "src/services/category.service";

@Component({
  selector: 'app-product-category-selector',
  templateUrl: './product-category-selector.component.html',
  styleUrls: ['./product-category-selector.component.scss']
})
export class ProductCategorySelectorComponent {
  @Input() allCategories: Category[] = []; // These must include top-level categories with their .Children populated
  @Input() selectedCategoryIds: string[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();

  selected = new Set<string>();

  ngOnInit() {
    this.selected = new Set(this.selectedCategoryIds);
  }

  toggleCategory(catId: string) {
    if (this.selected.has(catId)) {
      this.selected.delete(catId);
    } else {
      this.selected.add(catId);
    }
    this.selectionChange.emit(Array.from(this.selected));
    this.selectedCategoryIds = Array.from(this.selected);
  }

  isChecked(catId: string): boolean {
    return this.selected.has(catId);
  }

  panelOpen = false;

openCategoryPanel() {
  this.panelOpen = true;
}

closeCategoryPanel() {
  this.panelOpen = false;
}

removeCategory(id: string) {
  this.selected.delete(id);
  // this.emitSelection();
}

getCategoryName(id: string): string {
  const match = this.allCategories
    .flatMap(p => p.Children)
    .find(c => c?.CategoryId === id);
  return match?.Name || 'Unknown';
}

}
