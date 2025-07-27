import { Component, Input } from '@angular/core';
import { Company } from 'src/models/Company';

@Component({
  selector: 'app-store-footer',
  templateUrl: './store-footer.component.html',
  styleUrls: ['./store-footer.component.scss']
})
export class StoreFooterComponent {
  @Input({ required: true }) company!: Company;


  get whatsappLink() {
    const phone = this.company?.Phone?.replace(/\s+/g, '') || '';
    const message = `Hello, I’d like to learn more about your store.`.split(' ').join('%20');
    return phone ? `https://wa.me/${phone}?text=${message}` : '';
  }
}
