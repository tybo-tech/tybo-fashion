import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IForm } from 'src/models/IForm';

@Component({
  selector: 'app-form-modal',
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.scss'],
})
export class FormModalComponent {
  @Input() show_x = false;
  @Input({ required: true }) form!: IForm;
  @Output() onClose = new EventEmitter<any>();
  @Output() onSubmit = new EventEmitter<IForm>();
  submit() {
    this.onSubmit.emit(this.form);
  }
}
