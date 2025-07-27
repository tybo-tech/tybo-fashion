import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-book-consultation',
  templateUrl: './book-consultation.component.html',
  styleUrls: ['./book-consultation.component.scss'],
})
export class BookConsultationComponent {
  @Input() company?: Company;
  @Output() onClose = new EventEmitter<any>();

  message: string = '';

  ngOnInit() {
    this.setDefaultMessage();
  }

  setDefaultMessage() {
    this.message = this.company
      ? `Hi ${this.company.Name}, I'm interested in discussing my design needs. Can we chat?`
      : `Hi, I'm interested in your design services. Can we chat?`;
  }

  get whatsappLink() {
    if (!this.company || !this.company.Phone) return '';
    const phone = this.company.Phone;
    return `https://wa.me/${phone}?text=${encodeURIComponent(this.message)}`;
  }
}
