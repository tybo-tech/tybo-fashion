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
  @Output() qtyChange = new EventEmitter<number>();

  constructor() {}
  ngOnInit(): void {
    this.qty = Number(this.qty) || 1;
  }

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
