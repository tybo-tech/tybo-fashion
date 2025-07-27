import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-chip-picker',
  templateUrl: './chip-picker.component.html',
  styleUrls: ['./chip-picker.component.scss'],
})
export class ChipPickerComponent implements OnChanges {
  @Input() label: string = '';
  @Input() options: ChipOption[] = [];
  @Input() selectedIds: string[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() newItemAdded = new EventEmitter<string>(); // 🔥 for external handling
  search: string = '';
  panelOpen = false;
  showAdd = false;
  selected = new Set<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedIds']) {
      this.options.sort((a, b) => a.name.localeCompare(b.name));
      this.selected = new Set(this.selectedIds);
    }
  }



  toggle(id: string) {
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
    this.selectionChange.emit(Array.from(this.selected));
  }

  remove(id: string) {
    this.selected.delete(id);
    this.selectionChange.emit(Array.from(this.selected));
  }

  isChecked(id: string): boolean {
    return this.selected.has(id);
  }

  getName(id: string): string {
    return this.options.find((o) => o.id === id)?.name || 'Unknown';
  }

  openPanel() {
    this.panelOpen = true;
  }
  closePanel() {
    this.panelOpen = false;
  }
  get filteredOptions(): ChipOption[] {
    if (!this.search.trim()) return this.options;
    return this.options.filter((opt) =>
      opt.name.toLowerCase().includes(this.search.toLowerCase())
    );
  }
  onNewItem(name: string) {
    this.newItemAdded.emit(name);
    this.showAdd = false; 
  }
    trackByOption(index: number, opt: ChipOption): string {
    return opt.id;
  }
}
export interface ChipOption {
  id: string;
  name: string;
}
