import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Shared search input for admin list toolbars. Owns the debounce so every
 * list behaves identically:
 *
 *  - (search) fires debounceMs after the text settles.
 *  - (valueChange) fires immediately on every keystroke (for live binding).
 *  - An external `value` change (URL restore, Reset) that differs from the
 *    text on screen cancels any pending debounce, so a stale search can
 *    never fire after the parent already moved on.
 */
@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SearchInputComponent implements OnChanges {
  @Input() value = '';
  @Input() placeholder = 'Search…';
  @Input() disabled = false;
  @Input() debounceMs = 300;

  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  text = '';
  private pending: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      const incoming = this.value || '';
      if (incoming !== this.text) {
        this.text = incoming;
        this.cancelPending();
      }
    }
  }

  onInput(): void {
    this.valueChange.emit(this.text);
    this.cancelPending();
    if (this.debounceMs > 0) {
      this.pending = setTimeout(() => {
        this.pending = null;
        this.search.emit(this.text);
      }, this.debounceMs);
    } else {
      this.search.emit(this.text);
    }
  }

  private cancelPending(): void {
    if (this.pending !== null) {
      clearTimeout(this.pending);
      this.pending = null;
    }
  }
}
