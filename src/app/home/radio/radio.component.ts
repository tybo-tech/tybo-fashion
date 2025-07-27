import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IKeyValue } from 'src/models/ux.model';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
})
export class RadioComponent {
  @Input() options: IKeyValue[] = [
    {
      Key: 'standard',
      Value: 'Standard',
    },
    {
      Key: 'measurements',
      Value: 'Measurements',
    },
  ];
  @Input() selectedOption = 'standard';
  @Output() onSelect = new EventEmitter<string>();

  selectOption(selected: IKeyValue) {
    console.log(selected);
    this.selectedOption = selected.Key;
    this.onSelect.emit(selected.Key);
  }
}
