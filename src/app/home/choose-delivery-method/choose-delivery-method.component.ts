import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { Job } from 'src/models/job.model';

@Component({
  selector: 'app-choose-delivery-method',
  templateUrl: './choose-delivery-method.component.html',
  styleUrls: ['./choose-delivery-method.component.scss'],
})
export class ChooseDeliveryMethodComponent {
  @Input() job?: Job;
  shippingOptions = Constants.ShippingOptions
  @Output() deliveryMethodChanged = new EventEmitter<string>();
  update_delivery() {
    this.deliveryMethodChanged.emit(this.job?.Shipping);
  }
}
