import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-input',
  templateUrl: './admin-input.component.html',
  styleUrls: ['./admin-input.component.scss'],
})
export class AdminInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type:
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'number'
    | 'image'
    | 'date'
    | 'select'
    | 'time' = 'text';
  @Input() value: any = '';
  @Input() show_delete = false;
  @Input() options: {
    value: string;
    label: string;
  }[] = [];
  @Input() options_objects: { Name: string; Value: any }[] = [];
  @Input() id: string = '';
  @Output() inputChanged = new EventEmitter<any>();
  @Output() optionsObjectChanged = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() onImageChanged = new EventEmitter<string>();
  is_password_visible = false;
  ngOnInit(): void {
    if (!this.id) {
      this.id = `${new Date().getTime()}-${Math.random() * 1000}`;
    }
  }
  imageChanged($event: string) {
    this.value = $event;
    this.onImageChanged.emit($event);
  }
}
