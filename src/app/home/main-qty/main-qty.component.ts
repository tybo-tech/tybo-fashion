import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-main-qty',
  templateUrl: './main-qty.component.html',
  styleUrls: ['./main-qty.component.scss']
})
export class MainQtyComponent {
  @Input() qty: number = 1;
  @Input() max: number = 10;
  @Input() min: number = 1;
  @Input() step: number = 1;
  @Output() qtyChange = new EventEmitter<number>();

  constructor() {}

  increment() {
    if (this.qty < this.max) {
      this.qty += this.step;
      this.qtyChange.emit(this.qty);
    }
  }

  decrement() {
    if (this.qty > this.min) {
      this.qty -= this.step;
      this.qtyChange.emit(this.qty);
    }
  }

  onChange(event: any) {
    this.qty = event.target.value;
    this.qtyChange.emit(this.qty);
  }
}
