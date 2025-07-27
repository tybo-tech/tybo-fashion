import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'textarea' | 'number' = 'text';
  @Input() value:any = '';
  @Input() autocomplete: 'on' | 'off' = 'off';
  @Input() show_delete = false;
  @Input() options: string[] = [];
  @Input() id: string = '';
  @Output() inputChanged = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  is_password_visible = false;
  ngOnInit(): void {
    if (!this.id) {
      this.id = `${new Date().getTime()}-${Math.random() * 1000}`;
    }
  }
}
