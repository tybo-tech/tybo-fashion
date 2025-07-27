import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IKeyValue } from 'src/models/ux.model';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent {
  @Input() options: IKeyValue[] = [];
  @Input() selectedKey?: string;
  @Output() selectionChange = new EventEmitter<IKeyValue>();

  onSelect(option: IKeyValue): void {
    if (this.selectedKey !== option.Key) {
      this.selectedKey = option.Key;
      this.selectionChange.emit(option);
    }
  }
}
