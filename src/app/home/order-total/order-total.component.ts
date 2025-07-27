import { Component, Input } from '@angular/core';
import { Job } from 'src/models/job.model';

@Component({
  selector: 'app-order-total',
  templateUrl: './order-total.component.html',
  styleUrls: ['./order-total.component.scss'],
})
export class OrderTotalComponent {
  @Input() job?: Job;
}
