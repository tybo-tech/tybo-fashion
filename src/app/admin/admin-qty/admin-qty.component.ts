import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-admin-qty',
  templateUrl: './admin-qty.component.html',
  styleUrls: ['./admin-qty.component.scss'],
})
export class AdminQtyComponent implements OnInit {
  @Input() qty: number = 1;
  @Input() max: number = 1000;
  @Input() min: number = 1;
  @Input() step: number = 1;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Output() qtyChange = new EventEmitter<number>();

  constructor() {}

  ngOnInit(): void {
    this.qty = this.normalizeQuantity(this.qty);
  }

  get canIncrement(): boolean {
    return !this.disabled && this.qty < this.max;
  }

  get canDecrement(): boolean {
    return !this.disabled && this.qty > this.min;
  }

  increment(): void {
    if (this.canIncrement) {
      const newQty = this.qty + this.step;
      this.updateQuantity(newQty);
    }
  }

  decrement(): void {
    if (this.canDecrement) {
      const newQty = this.qty - this.step;
      this.updateQuantity(newQty);
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    this.updateQuantity(value);
  }

  onInputBlur(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    const normalizedValue = this.normalizeQuantity(value);

    if (value !== normalizedValue) {
      target.value = normalizedValue.toString();
      this.updateQuantity(normalizedValue);
    }
  }

  private updateQuantity(newQty: number): void {
    const normalizedQty = this.normalizeQuantity(newQty);
    if (normalizedQty !== this.qty) {
      this.qty = normalizedQty;
      this.qtyChange.emit(this.qty);
    }
  }

  private normalizeQuantity(value: number): number {
    const numValue = Number(value) || this.min;
    return Math.max(this.min, Math.min(this.max, numValue));
  }
}
